import * as P from 'parsimmon';
import { createLeaf, createTree, urlRegex } from './prelude';
import { takeWhile, cumulativeSum } from '../prelude/array';
import parseAcct from '../misc/acct/parse';
import { toUnicode } from 'punycode';
import { emojiRegex } from '../misc/emoji-regex';

export function removeOrphanedBrackets(s: string): string {
	const openBrackets = ['(', '「', '['];
	const closeBrackets = [')', '」', ']'];
	const xs = cumulativeSum(s.split('').map(c => {
		if (openBrackets.includes(c)) return 1;
		if (closeBrackets.includes(c)) return -1;
		return 0;
	}));
	const firstOrphanedCloseBracket = xs.findIndex(x => x < 0);
	if (firstOrphanedCloseBracket !== -1) return s.substr(0, firstOrphanedCloseBracket);
	const lastMatched = xs.lastIndexOf(0);
	return s.substr(0, lastMatched + 1);
}

export const mfmLanguage = P.createLanguage({
	root: r => P.alt(r.block, r.inline).atLeast(1),
	plain: r => P.alt(r.emoji, r.text).atLeast(1),
	block: r => P.alt(
		r.quote,
	),
	startOfLine: () => P((input, i) => {
		if (i == 0 || input[i] == '\n' || input[i - 1] == '\n') {
			return P.makeSuccess(i, null);
		} else {
			return P.makeFailure(i, 'not newline');
		}
	}),
	quote: r => r.startOfLine.then(P((input, i) => {
		const text = input.substr(i);
		if (!text.match(/^>[\s\S]+?/)) return P.makeFailure(i, 'not a quote');
		const quote = takeWhile(line => line.startsWith('>'), text.split('\n'));
		const qInner = quote.join('\n').replace(/^>/gm, '').replace(/^ /gm, '');
		if (qInner == '') return P.makeFailure(i, 'not a quote');
		const contents = r.root.tryParse(qInner);
		return P.makeSuccess(i + quote.join('\n').length + 1, createTree('quote', contents, {}));
	})),
	inline: r => P.alt(
		r.bold,
		r.small,
		r.italic,
		r.strike,
		r.mention,
		r.hashtag,
		r.url,
		r.link,
		r.emoji,
		r.text
	),
	bold: r => {
		const asterisk = P.regexp(/\*\*([\s\S]+?)\*\*/, 1);
		const underscore = P.regexp(/__([a-zA-Z0-9\s]+?)__/, 1);
		return P.alt(asterisk, underscore).map(x => createTree('bold', r.inline.atLeast(1).tryParse(x), {}));
	},
	small: r => P.regexp(/<small>([\s\S]+?)<\/small>/, 1).map(x => createTree('small', r.inline.atLeast(1).tryParse(x), {})),
	italic: r => {
		const xml = P.regexp(/<i>([\s\S]+?)<\/i>/, 1);
		const underscore = P((input, i) => {
			const text = input.substr(i);
			const match = text.match(/^(\*|_)([a-zA-Z0-9]+?[\s\S]*?)\1/);
			if (!match) return P.makeFailure(i, 'not a italic');
			if (input[i - 1] != null && input[i - 1] != ' ' && input[i - 1] != '\n') return P.makeFailure(i, 'not a italic');
			return P.makeSuccess(i + match[0].length, match[2]);
		});

		return P.alt(xml, underscore).map(x => createTree('italic', r.inline.atLeast(1).tryParse(x), {}));
	},
	strike: r => P.regexp(/~~([^\n~]+?)~~/, 1).map(x => createTree('strike', r.inline.atLeast(1).tryParse(x), {})),
	mention: () => {
		return P((input, i) => {
			const text = input.substr(i);
			const match = text.match(/^@\w([\w-]*\w)?(?:@[\w.\-]+\w)?/);
			if (!match) return P.makeFailure(i, 'not a mention');
			if (input[i - 1] != null && input[i - 1].match(/[a-z0-9]/i)) return P.makeFailure(i, 'not a mention');
			return P.makeSuccess(i + match[0].length, match[0]);
		}).map(x => {
			const { username, host } = parseAcct(x.substr(1));
			const canonical = host != null ? `@${username}@${toUnicode(host)}` : x;
			return createLeaf('mention', { canonical, username, host, acct: x });
		});
	},
	hashtag: () => P((input, i) => {
		const text = input.substr(i);
		const match = text.match(/^#([^\s.,!?'"#:\/\[\]【】]+)/i);
		if (!match) return P.makeFailure(i, 'not a hashtag');
		let hashtag = match[1];
		hashtag = removeOrphanedBrackets(hashtag);
		if (hashtag.match(/^(\u20e3|\ufe0f)/)) return P.makeFailure(i, 'not a hashtag');
		if (hashtag.match(/^[0-9]+$/)) return P.makeFailure(i, 'not a hashtag');
		if (input[i - 1] != null && input[i - 1].match(/[a-z0-9]/i)) return P.makeFailure(i, 'not a hashtag');
		if (Array.from(hashtag || '').length > 128) return P.makeFailure(i, 'not a hashtag');
		return P.makeSuccess(i + ('#' + hashtag).length, createLeaf('hashtag', { hashtag: hashtag }));
	}),
	url: () => {
		return P((input, i) => {
			const text = input.substr(i);
			const match = text.match(urlRegex);
			let url: string;
			if (!match) {
				const match = text.match(/^<(https?:\/\/.*?)>/);
				if (!match) {
					return P.makeFailure(i, 'not a url');
				}
				url = match[1];
				i += 2;
			} else {
				url = match[0];
			}
			url = removeOrphanedBrackets(url);
			url = url.replace(/[.,]*$/, '');
			return P.makeSuccess(i + url.length, url);
		}).map(x => createLeaf('url', { url: x }));
	},
	link: r => {
		return P.seqObj(
			['silent', P.string('?').fallback(null).map(x => x != null)] as any,
			P.string('['), ['text', P.regexp(/[^\n\[\]]+/)] as any, P.string(']'),
			P.string('('), ['url', r.url] as any, P.string(')'),
		).map((x: any) => {
			return createTree('link', r.inline.atLeast(1).tryParse(x.text), {
				silent: x.silent,
				url: x.url.node.props.url
			});
		});
	},
	emoji: () => {
		const name = P.regexp(/:([a-z0-9_+-]+):/i, 1).map(x => createLeaf('emoji', { name: x }));
		const code = P.regexp(emojiRegex).map(x => createLeaf('emoji', { emoji: x }));
		return P.alt(name, code);
	},
	text: () => P.any.map(x => createLeaf('text', { text: x }))
});