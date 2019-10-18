import $ from 'cafy';
import define from '../../define';
import { getConnection } from 'typeorm';
import { Meta } from '../../../../models/entities/meta';
import { DB_MAX_NOTE_TEXT_LENGTH } from '../../../../misc/hard-limits';

export const meta = {
	desc: {
		'ja-JP': 'インスタンスの設定を更新します。'
	},

	tags: ['admin'],

	requireCredential: true,
	requireModerator: true,

	params: {
		announcements: {
			validator: $.optional.nullable.arr($.obj()),
			desc: {
				'ja-JP': 'お知らせ'
			}
		},

		disableRegistration: {
			validator: $.optional.nullable.bool,
			desc: {
				'ja-JP': '招待制か否か'
			}
		},

		disableLocalTimeline: {
			validator: $.optional.nullable.bool,
			desc: {
				'ja-JP': 'ローカルタイムライン(とソーシャルタイムライン)を無効にするか否か'
			}
		},

		disableGlobalTimeline: {
			validator: $.optional.nullable.bool,
			desc: {
				'ja-JP': 'グローバルタイムラインを無効にするか否か'
			}
		},

		enableEmojiReaction: {
			validator: $.optional.nullable.bool,
			desc: {
				'ja-JP': '絵文字リアクションを有効にするか否か'
			}
		},

		useStarForReactionFallback: {
			validator: $.optional.nullable.bool,
			desc: {
				'ja-JP': '不明なリアクションのフォールバックに star リアクションを使うか'
			}
		},

		pinnedUsers: {
			validator: $.optional.nullable.arr($.str),
			desc: {
				'ja-JP': 'ピン留めユーザー'
			}
		},

		hiddenTags: {
			validator: $.optional.nullable.arr($.str),
			desc: {
				'ja-JP': '統計などで無視するハッシュタグ'
			}
		},

		blockedHosts: {
			validator: $.optional.nullable.arr($.str),
			desc: {
				'ja-JP': 'ブロックするホスト'
			}
		},

		mascotImageUrl: {
			validator: $.optional.nullable.str,
			desc: {
				'ja-JP': 'インスタンスキャラクター画像のURL'
			}
		},

		bannerUrl: {
			validator: $.optional.nullable.str,
			desc: {
				'ja-JP': 'インスタンスのバナー画像URL'
			}
		},

		errorImageUrl: {
			validator: $.optional.nullable.str,
			desc: {
				'ja-JP': 'インスタンスのエラー画像URL'
			}
		},

		iconUrl: {
			validator: $.optional.nullable.str,
			desc: {
				'ja-JP': 'インスタンスのアイコンURL'
			}
		},

		name: {
			validator: $.optional.nullable.str,
			desc: {
				'ja-JP': 'インスタンス名'
			}
		},

		description: {
			validator: $.optional.nullable.str,
			desc: {
				'ja-JP': 'インスタンスの紹介文'
			}
		},

		maxNoteTextLength: {
			validator: $.optional.num.min(0).max(DB_MAX_NOTE_TEXT_LENGTH),
			desc: {
				'ja-JP': '投稿の最大文字数'
			}
		},

		localDriveCapacityMb: {
			validator: $.optional.num.min(0),
			desc: {
				'ja-JP': 'ローカルユーザーひとりあたりのドライブ容量 (メガバイト単位)',
				'en-US': 'Drive capacity of a local user (MB)'
			}
		},

		remoteDriveCapacityMb: {
			validator: $.optional.num.min(0),
			desc: {
				'ja-JP': 'リモートユーザーひとりあたりのドライブ容量 (メガバイト単位)',
				'en-US': 'Drive capacity of a remote user (MB)'
			}
		},

		cacheRemoteFiles: {
			validator: $.optional.bool,
			desc: {
				'ja-JP': 'リモートのファイルをキャッシュするか否か'
			}
		},

		enableRecaptcha: {
			validator: $.optional.bool,
			desc: {
				'ja-JP': 'reCAPTCHAを使用するか否か'
			}
		},

		recaptchaSiteKey: {
			validator: $.optional.nullable.str,
			desc: {
				'ja-JP': 'reCAPTCHA site key'
			}
		},

		recaptchaSecretKey: {
			validator: $.optional.nullable.str,
			desc: {
				'ja-JP': 'reCAPTCHA secret key'
			}
		},

		proxyAccount: {
			validator: $.optional.nullable.str,
			desc: {
				'ja-JP': 'プロキシアカウントのユーザー名'
			}
		},

		maintainerName: {
			validator: $.optional.nullable.str,
			desc: {
				'ja-JP': 'インスタンスの管理者名'
			}
		},

		maintainerEmail: {
			validator: $.optional.nullable.str,
			desc: {
				'ja-JP': 'インスタンス管理者の連絡先メールアドレス'
			}
		},

		langs: {
			validator: $.optional.arr($.str),
			desc: {
				'ja-JP': 'インスタンスの対象言語'
			}
		},

		summalyProxy: {
			validator: $.optional.nullable.str,
			desc: {
				'ja-JP': 'summalyプロキシURL'
			}
		},

		enableServiceWorker: {
			validator: $.optional.bool,
			desc: {
				'ja-JP': 'ServiceWorkerを有効にするか否か'
			}
		},

		swPublicKey: {
			validator: $.optional.nullable.str,
			desc: {
				'ja-JP': 'ServiceWorkerのVAPIDキーペアの公開鍵'
			}
		},

		swPrivateKey: {
			validator: $.optional.nullable.str,
			desc: {
				'ja-JP': 'ServiceWorkerのVAPIDキーペアの秘密鍵'
			}
		},

		useObjectStorage: {
			validator: $.optional.bool
		},

		objectStorageBaseUrl: {
			validator: $.optional.nullable.str
		},

		objectStorageBucket: {
			validator: $.optional.nullable.str
		},

		objectStoragePrefix: {
			validator: $.optional.nullable.str
		},

		objectStorageEndpoint: {
			validator: $.optional.nullable.str
		},

		objectStorageRegion: {
			validator: $.optional.nullable.str
		},

		objectStoragePort: {
			validator: $.optional.nullable.num
		},

		objectStorageAccessKey: {
			validator: $.optional.nullable.str
		},

		objectStorageSecretKey: {
			validator: $.optional.nullable.str
		},

		objectStorageUseSSL: {
			validator: $.optional.bool
		},
	}
};

export default define(meta, async (ps, me) => {
	const set = {} as Partial<Meta>;

	if (typeof ps.useStarForReactionFallback === 'boolean') {
		set.useStarForReactionFallback = ps.useStarForReactionFallback;
	}

	if (Array.isArray(ps.blockedHosts)) {
		set.blockedHosts = ps.blockedHosts.filter(Boolean);
	}

	if (ps.name !== undefined) {
		set.name = ps.name;
	}

	if (ps.description !== undefined) {
		set.description = ps.description;
	}

	if (ps.maxNoteTextLength) {
		set.maxNoteTextLength = ps.maxNoteTextLength;
	}

	if (ps.localDriveCapacityMb !== undefined) {
		set.localDriveCapacityMb = ps.localDriveCapacityMb;
	}

	if (ps.remoteDriveCapacityMb !== undefined) {
		set.remoteDriveCapacityMb = ps.remoteDriveCapacityMb;
	}

	if (ps.cacheRemoteFiles !== undefined) {
		set.cacheRemoteFiles = ps.cacheRemoteFiles;
	}

	if (ps.enableRecaptcha !== undefined) {
		set.enableRecaptcha = ps.enableRecaptcha;
	}

	if (ps.recaptchaSiteKey !== undefined) {
		set.recaptchaSiteKey = ps.recaptchaSiteKey;
	}

	if (ps.recaptchaSecretKey !== undefined) {
		set.recaptchaSecretKey = ps.recaptchaSecretKey;
	}

	if (ps.proxyAccount !== undefined) {
		set.proxyAccount = ps.proxyAccount;
	}

	if (ps.maintainerName !== undefined) {
		set.maintainerName = ps.maintainerName;
	}

	if (ps.maintainerEmail !== undefined) {
		set.maintainerEmail = ps.maintainerEmail;
	}

	if (ps.summalyProxy !== undefined) {
		set.summalyProxy = ps.summalyProxy;
	}

	if (ps.enableServiceWorker !== undefined) {
		set.enableServiceWorker = ps.enableServiceWorker;
	}

	if (ps.swPublicKey !== undefined) {
		set.swPublicKey = ps.swPublicKey;
	}

	if (ps.swPrivateKey !== undefined) {
		set.swPrivateKey = ps.swPrivateKey;
	}

	if (ps.useObjectStorage !== undefined) {
		set.useObjectStorage = ps.useObjectStorage;
	}

	if (ps.objectStorageBaseUrl !== undefined) {
		set.objectStorageBaseUrl = ps.objectStorageBaseUrl;
	}

	if (ps.objectStorageBucket !== undefined) {
		set.objectStorageBucket = ps.objectStorageBucket;
	}

	if (ps.objectStoragePrefix !== undefined) {
		set.objectStoragePrefix = ps.objectStoragePrefix;
	}

	if (ps.objectStorageEndpoint !== undefined) {
		set.objectStorageEndpoint = ps.objectStorageEndpoint;
	}

	if (ps.objectStorageRegion !== undefined) {
		set.objectStorageRegion = ps.objectStorageRegion;
	}

	if (ps.objectStoragePort !== undefined) {
		set.objectStoragePort = ps.objectStoragePort;
	}

	if (ps.objectStorageAccessKey !== undefined) {
		set.objectStorageAccessKey = ps.objectStorageAccessKey;
	}

	if (ps.objectStorageSecretKey !== undefined) {
		set.objectStorageSecretKey = ps.objectStorageSecretKey;
	}

	if (ps.objectStorageUseSSL !== undefined) {
		set.objectStorageUseSSL = ps.objectStorageUseSSL;
	}

	await getConnection().transaction(async transactionalEntityManager => {
		const meta = await transactionalEntityManager.findOne(Meta, {
			order: {
				id: 'DESC'
			}
		});

		if (meta) {
			await transactionalEntityManager.update(Meta, meta.id, set);
		} else {
			await transactionalEntityManager.save(Meta, set);
		}
	});
});