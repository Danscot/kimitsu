
import test from './test.js';

import ping from './ping.js';

import vv from './vv.js';

import save from './save.js';

import play from './play.js';

import tiktok from './tiktok.js';

import mentions from './mentions.js';

import sticker from './sticker.js';

import gcstatus from './gcstatus.js'

import sudo from './sudo.js';

import publicMode from './public.js';

import prefix from './setprefix.js';

import antidel from './antidel.js';

import menu from './menu.js';

import manual from './man.js';

import status from './status.js';

import respons from './respons.js';

import settag from './settag.js';

export const commands = {

	test: test,

	ping: ping,

	vv: vv,

	save: save,

	tagall: mentions.tagall,

	tagadmin: mentions.tagadmin,

	tag: mentions.tag, 

	play: play,

	tiktok: tiktok,

	sticker:sticker,

	gcstatus: gcstatus,

	sudo: sudo.sudo,

	getsudo: sudo.getsudo,

	delsudo: sudo.delsudo,

	public: publicMode,

	setprefix: prefix,

	antidel: antidel,

	menu: menu,

	status: status,

	help: manual,

	respons: respons,

	settag: settag

};
