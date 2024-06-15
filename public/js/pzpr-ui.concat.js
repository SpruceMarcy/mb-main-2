/*!
 * @license
 *
 * pzpr.js v
 *  https://github.com/sabo2/pzprv3
 *
 * This script includes candle.js, see below
 *  https://github.com/sabo2/candle
 *
 * Copyright 2009-2024 sabo2
 *
 * This script is released under the MIT license. Please see below.
 *  http://www.opensource.org/licenses/mit-license.php
 *
 * Date: 2024-06-15
 */
// intro.js

(function(){

// Boot.js v3.4.0

(function() {
	/********************************/
	/* 初期化時のみ使用するルーチン */
	/********************************/

	var onload_pzv = null;
	var onload_pzl = null;
	var onload_option = {};

	//---------------------------------------------------------------------------
	// ★boot() window.onload直後の処理
	//---------------------------------------------------------------------------
	pzpr.on("load", function boot() {
		if (importData()) {
			startPuzzle();
		} else {
			setTimeout(boot, 0);
		}
	});

	function importData() {
		if (!onload_pzl) {
			/* 1) 盤面複製・index.htmlからのファイル入力/Database入力か */
			/* 2) URL(?以降)をチェック */
			onload_pzl = importURL();

			/* 指定されたパズルがない場合はさようなら～ */
			if (!onload_pzl || !onload_pzl.pid) {
				failOpen();
			}
		}

		return true;
	}

	function failOpen() {
		if (!!ui.puzzle && !!ui.puzzle.pid) {
			return;
		}
		var title2 = document.getElementById("title2");
		if (!!title2) {
			title2.innerHTML = "Fail to import puzzle data or URL.";
		}
		document.getElementById("menupanel").innerHTML = "";
	}

	function startPuzzle() {
		var pzl = onload_pzl;
		ui.pzv = onload_pzv; // for the puzz.link callback

		/* IE SVGのtextLengthがうまく指定できていないので回避策を追加 */
		if (
			(function(ua) {
				return (
					ua.match(/MSIE/) || (ua.match(/AppleWebKit/) && ua.match(/Edge/))
				);
			})(navigator.userAgent)
		) {
			onload_option.graphic = "canvas";
		}

		/* パズルオブジェクトの作成 */
		var element = document.getElementById("divques");
		var puzzle = (ui.puzzle = new pzpr.Puzzle(element, onload_option));
		pzpr.connectKeyEvents(puzzle);

		/* パズルオブジェクト作成〜open()間に呼ぶ */
		ui.event.onload_func(onload_option);

		// 単体初期化処理のルーチンへ
		puzzle.once("fail-open", failOpen);
		puzzle.open(pzl);
		if (onload_option.variant !== void 0) {
			puzzle.config.set("variant", true);
		}

		puzzle.on("request-aux-editor", ui.auxeditor.open);

		if (!!onload_option.net) {
			ui.network.configure(onload_option.net, onload_option.key);
		}

		return true;
	}

	//---------------------------------------------------------------------------
	// ★importURL() 初期化時にURLを解析し、パズルの種類・エディタ/player判定を行う
	//---------------------------------------------------------------------------
	function importURL() {
		/* index.htmlからURLが入力されていない場合は現在のURLの?以降をとってくる */
		var search = location.search;
		if (!search) {
			return null;
		}

		/* 一旦先頭の?記号を取り除く */
		if (search.charAt(0) === "?") {
			search = search.substr(1);
		}

		while (search.match(/^(\w+)\=(\w+)\&(.*)/)) {
			onload_option[RegExp.$1] = RegExp.$2;
			search = RegExp.$3;
		}

		onload_pzv = search;
		var pzl = pzpr.parser.parseURL(search);
		var startmode = pzl.mode || (!pzl.body ? "editor" : "player");
		onload_option.type = onload_option.type || startmode;

		return pzl;
	}
})();

// UI.js v3.4.0
/* eslint-env browser */
/* exported ui, _doc, getEL, createEL */

/* ui.js Locals */
var _doc = document;
function getEL(id) {
	return _doc.getElementById(id);
}
function createEL(tagName) {
	return _doc.createElement(tagName);
}

//---------------------------------------------------------------------------
// ★uiオブジェクト UserInterface側のオブジェクト
//---------------------------------------------------------------------------
/* extern */
window.ui = {
	version: "",

	/* このサイトで使用するパズルのオブジェクト */
	puzzle: null,

	/* どの種類のパズルのメニューを表示しているか */
	currentpid: "",

	/* メンバオブジェクト */
	event: null,
	menuconfig: null,
	urlconfig: null,
	menuarea: null,
	toolarea: null,
	popupmgr: null,
	keypopup: null,
	timer: null,
	network: null,

	enableGetText: false, // FileReader APIの旧仕様でファイルが読めるか
	enableReadText: false, // HTML5 FileReader APIでファイルが読めるか
	reader: null, // FileReaderオブジェクト

	enableSaveImage: false, // 画像保存が可能か
	enableImageType: {}, // 保存可能な画像形式

	enableSaveBlob: false, // saveBlobが使用できるか

	callbackComplete: null,

	//---------------------------------------------------------------------------
	// ui.displayAll()     全てのメニュー、ボタン、ラベルに対して文字列を設定する
	// ui.setdisplay()     個別のメニュー、ボタン、ラベルに対して文字列を設定する
	//---------------------------------------------------------------------------
	displayAll: function() {
		ui.menuarea.display();
		ui.toolarea.display();
		ui.popupmgr.translate();
		ui.misc.displayDesign();
	},
	setdisplay: function(idname) {
		ui.menuarea.setdisplay(idname);
		ui.toolarea.setdisplay(idname);
	},

	//---------------------------------------------------------------------------
	// ui.customAttr()   エレメントのカスタムattributeの値を返す
	//---------------------------------------------------------------------------
	customAttr: function(el, name) {
		var value = "";
		if (el.dataset !== void 0) {
			value = el.dataset[name];
		} else {
			/* IE10, Firefox5, Chrome7, Safari5.1以下のフォールバック */
			var lowername = "data-";
			for (var i = 0; i < name.length; i++) {
				var ch = name[i] || name.charAt(i);
				lowername += ch >= "A" && ch <= "Z" ? "-" + ch.toLowerCase() : ch;
			}
			value = el[lowername] || el.getAttribute(lowername) || "";
		}
		return value;
	},

	//----------------------------------------------------------------------
	// ui.windowWidth()   ウィンドウの幅を返す
	//----------------------------------------------------------------------
	windowWidth: function() {
		return window.innerHeight !== void 0
			? window.innerWidth
			: _doc.body.clientWidth;
	},

	//---------------------------------------------------------------------------
	// ui.adjustcellsize()  resizeイベント時に、pc.cw, pc.chのサイズを(自動)調節する
	// ui.getBoardPadding() Canvasと境界線の周りの間にあるpaddingのサイズを求めます
	//---------------------------------------------------------------------------
	adjustcellsize: function() {
		var puzzle = ui.puzzle,
			pc = puzzle.painter;
		var cols = pc.getCanvasCols() + ui.getBoardPadding() * 2;
		var wwidth = ui.windowWidth() - (ui.urlconfig.embed ? 0 : 6);
		var mwidth; //  margin/borderがあるので、適当に引いておく
		var uiconf = ui.menuconfig;

		var cellsize,
			cellsizeval = uiconf.get("cellsizeval") * pc.cellexpandratio;
		var cr = { base: 1.0, limit: 0.4 },
			ws = { base: 0.8, limit: 0.96 },
			ci = [];
		ci[0] = (wwidth * ws.base) / (cellsizeval * cr.base);
		ci[1] = (wwidth * ws.limit) / (cellsizeval * cr.base);
		ci[2] = (wwidth * ws.limit) / (cellsizeval * cr.limit);

		// 横幅いっぱいに広げたい場合
		if (uiconf.get("fullwidth")) {
			mwidth = wwidth * 0.98;
			cellsize = (mwidth * 0.92) / cols;
		}
		// 縮小が必要ない場合
		else if (!uiconf.get("adjsize") || cols < ci[0]) {
			mwidth = wwidth * ws.base - 4;
			cellsize = cellsizeval * cr.base;
		}
		// ひとまずセルのサイズを変えずにmainの幅を調節する場合
		else if (cols < ci[1]) {
			cellsize = cellsizeval * cr.base;
			mwidth = cellsize * cols;
		}
		// base～limit間でサイズを自動調節する場合
		else if (cols < ci[2]) {
			mwidth = wwidth * ws.limit - 4;
			cellsize = mwidth / cols; // 外枠ぎりぎりにする
		}
		// 自動調整の下限値を超える場合
		else {
			cellsize = cellsizeval * cr.limit;
			mwidth = cellsize * cols;
		}

		// mainのサイズ変更
		if (!pc.outputImage) {
			getEL("main").style.width = "" + (mwidth | 0) + "px";
			if (ui.urlconfig.embed) {
				getEL("main").style.border = "none";
			}
		}

		puzzle.setCanvasSizeByCellSize(cellsize, true);
	},
	getBoardPadding: function() {
		var puzzle = ui.puzzle,
			padding = 0;
		switch (puzzle.pid) {
			case "firefly":
			case "hashikake":
			case "wblink":
			case "ichimaga":
			case "ichimagam":
			case "ichimagax":
				padding = 0.3;
				break;

			case "kouchoku":
			case "gokigen":
			case "wagiri":
			case "creek":
				padding = 0.2;
				break;

			case "slither":
			case "cave":
			case "mejilink":
				padding = 0.15;
				break;

			case "kinkonkan":
			case "skyscrapers":
			case "easyasabc":
			case "box":
				padding = 0.05;
				break;

			case "bosanowa":
				padding = ui.menuconfig.get("disptype_bosanowa") !== 2 ? 0.5 : 0.05;
				break;

			default:
				padding = 0.5;
				break;
		}
		if (ui.menuconfig.get("fullwidth")) {
			padding = 0;
		}
		return padding;
	},

	//--------------------------------------------------------------------------------
	// ui.selectStr()  現在の言語に応じた文字列を返す
	//--------------------------------------------------------------------------------
	selectStr: function(strJP, strEN) {
		if (!strEN) {
			return strJP;
		}
		if (!strJP) {
			return strEN;
		}
		return pzpr.lang === "ja" ? strJP : strEN;
	},

	i18n: function(strKey) {
		return this.selectStr(this.langs.ja[strKey], this.langs.en[strKey]);
	},

	//---------------------------------------------------------------------------
	// ui.getCurrentConfigList() 現在のパズルで有効な設定と設定値を返す
	//---------------------------------------------------------------------------
	getCurrentConfigList: function() {
		return ui.menuconfig.getList();
	},

	//----------------------------------------------------------------------
	// ui.initFileReadMethod() ファイルアクセス関連の処理の初期化を行う
	//----------------------------------------------------------------------
	initFileReadMethod: function() {
		// File Reader (あれば)の初期化処理
		if (typeof FileReader !== "undefined") {
			this.reader = new FileReader();
			this.reader.onload = function(e) {
				ui.puzzle.open(e.target.result);
			};
			this.enableReadText = true;
		} else {
			this.reader = null;
			this.enableGetText =
				typeof FileList !== "undefined" &&
				typeof File.prototype.getAsText !== "undefined";
		}
	},

	//----------------------------------------------------------------------
	// ui.initImageSaveMethod() 画像保存関連の処理の初期化を行う
	//----------------------------------------------------------------------
	initImageSaveMethod: function(puzzle) {
		if (
			!!pzpr.Candle.enable.canvas &&
			!!_doc.createElement("canvas").toDataURL
		) {
			this.enableImageType.png = true;

			var canvas = _doc.createElement("canvas");
			canvas.width = canvas.height = 1;
			if (canvas.toDataURL("image/gif").match("image/gif")) {
				this.enableImageType.gif = true;
			}
			if (canvas.toDataURL("image/jpeg").match("image/jpeg")) {
				this.enableImageType.jpeg = true;
			}
			if (canvas.toDataURL("image/webp").match("image/webp")) {
				this.enableImageType.webp = true;
			}
		}
		if (!!pzpr.Candle.enable.svg && !!window.btoa) {
			this.enableImageType.svg = true;
		}
		if (!!this.enableImageType.png || !!this.enableImageType.svg) {
			this.enableSaveImage = true;
		}

		this.enableSaveBlob = !!window.navigator.saveBlob;
	}
};

// langs.js

ui.langs = {
	en: {"editor":"editor","beforeunload":"The board is edited.","completed":"Complete!","cancel":"Cancel","close":"Close","delete":"Delete","menu_file":"File","newboard":"New board","urlinput":"Load from URL","urloutput":"Export URL","fileopen":"Open file","filesave":"Save file as …","duplicate":"Duplicate the board","imagesave":"Save as image file","menu_edit":"Edit","adjust":"Adjust the board","turnflip":"Flip/Turn the board","menu_display":"Display","cellsize":"Cell size","cellsize.xs":"Extra small","cellsize.s":"Small","cellsize.n":"Normal","cellsize.l":"Large","cellsize.xl":"Extra large","cellsize.custom":"Set by number …","font":"Font family","font.sans":"Sans-serif","font.serif":"Serif","dispqnumbg":"Paint background of clue circles","undefcell":"Paint uninputted cells","cursor":"Show cursor","trialmarker":"Show trial markers","adjsize":"Auto size adjust","fullwidth":"Expand canvas width","toolarea.show":"Show tool area","toolarea.hide":"Hide tool area","menu_setting":"Setting","lrinvert":"Invert mouse button","use_tri":"Input type","use_tri.1":"Corner-side","use_tri.2":"Pull-to-input","use_tri.3":"One button","bgcolor.menu":"Input background color","autoerr.menu.hitori":"Show overlapped number","autoerr.menu.gokigen":"Loop slash with color","multierr":"Check multiple errors","forceallcell.menu":"Number in all cells","dirauxmark.menu":"Direction aux. mark","enline.menu":"Line between points","lattice.menu":"Check lattice point","singlenum.menu":"Single number in a region","discolor":"Disable color","mouseonly":"Enable mouse-only input","patchwork_leftaux":"Enable to input aux. lines with single click","autocheck":"Answer check","autocheck.off":"Manual","autocheck.guarded":"Automatic (guarded)","autocheck.simple":"Automatic (always)","menu_help":"Help","rules":"Rules","about":"About puzz.link","translate":"Help us translate","issues":"Bug reports and feature requests","mode":"Mode","mode.edit":"Edit mode","mode.play":"Answer mode","use":"Input Type","use.1":"L/R buttons","use.2":"One button","preset.pentominoes":"Pentominoes","preset.tetrominoes":"Tetrominoes","preset.double_tetrominoes":"Double tetrominoes","preset.copy_answer":"Copy answer to bank","preset.zero":"No pieces","preset.fleet3":"Battleships (size 3)","preset.fleet4":"Battleships (size 4)","preset.fleet5":"Battleships (size 5)","inputmode":"Input Mode","inputmode.auto":"Auto","inputmode.slide":"Slide","inputmode.shade":"Shaded cells","inputmode.unshade":"Unshaded cells","inputmode.number":"Number","inputmode.number-":"Number (rev)","inputmode.letter":"Alphabet","inputmode.letter-":"Alphabet (rev)","inputmode.quesmark":"Question marks","inputmode.quesmark-":"Question marks (rev)","inputmode.color":"Color","inputmode.color-":"Color (rev)","inputmode.symbol":"Symbol","inputmode.symbol-":"Symbol (rev)","inputmode.border":"Border","inputmode.sub-border":"Sub-border","inputmode.subline":"Aux. conn. lines","inputmode.direc":"Direction","inputmode.arrow":"Arrows","inputmode.circle-unshade":"Unshaded circles","inputmode.circle-shade":"Shaded circles","inputmode.circle-gray":"Gray circles","inputmode.goat":"Goats","inputmode.wolf":"Wolves","inputmode.moon":"Marks of moon","inputmode.sun":"Marks of sun","inputmode.empty":"Invalid cells","inputmode.ice":"Icebarns","inputmode.water":"Water hazard","inputmode.nabe":"Crocks","inputmode.box":"Boxes","inputmode.pin":"Pins","inputmode.crossdot":"Shaded dots","inputmode.ineq":"Inequality marks","inputmode.move-clue":"Move clue","inputmode.copy-answer":"Copy answer","inputmode.mark-circle":"Circles","inputmode.mark-triangle":"Triangles","inputmode.mark-rect":"Rectangles","inputmode.mark-tree":"Trees","inputmode.mark-tent":"Tents","inputmode.mark-cross":"Crosses","inputmode.undef":"Question marks","inputmode.line":"Lines","inputmode.peke":"Cross marks","inputmode.diraux":"Aux. dir. marks","inputmode.bar":"Bars","inputmode.akari":"Bulbs","inputmode.star":"Stars","inputmode.dot":"Dots","inputmode.balloon":"Balloons","inputmode.ironball":"Iron balls","inputmode.futon":"Futons","inputmode.completion":"Completion","inputmode.copycircle":"Copy circles","inputmode.copynum":"Copy nums","inputmode.copyletter":"Copy letters","inputmode.copysymbol":"Copy symbols","inputmode.dragnum+":"Drag inc. nums","inputmode.dragnum-":"Drag dec. nums","inputmode.objblank":"Aux. dots","inputmode.numexist":"Aux. circles","inputmode.numblank":"Aux. crosses","inputmode.subcircle":"Aux. circles","inputmode.subcross":"Aux. crosses","inputmode.bgcolor":"Bgcolor 1/2","inputmode.bgcolor1":"Bgcolor 1","inputmode.bgcolor2":"Bgcolor 2","inputmode.bgpaint":"Draft sketch","inputmode.clear":"Erase data","inputmode.info-line":"Check line connection","inputmode.info-blk":"Check shaded cell connection","inputmode.info-ublk":"Check unshaded cell connection","inputmode.info-room":"Check room connection","inputmode.info-road":"Check route","disptype":"Display","context_marks":"Show direction indicators","disptype_yajilin.1":"Original style","disptype_yajilin.2":"Gray background","disptype_bosanowa.1":"Original style","disptype_bosanowa.2":"Sokoban style","disptype_bosanowa.3":"Waritai style","disptype_interbd.1":"Colors","disptype_interbd.2":"Shapes","disptype_interbd.3":"Both","dispmove":"Display as object moving","bgcolor.tool":"Allow inputting background color when cell center is clicked","autocmp.number":"Grey each correct number","autocmp.room":"Paint background of each completed block","autocmp.akari":"Paint background of each illuminated block","autocmp.kouchoku":"Grey each letter which links over two segments","autocmp.border":"Grey border between different areas","autoerr.tool.hitori":"Show overlapped number as red","autoerr.tool.gokigen":"Draw loop line as red","autoerr.tool.wagiri":"Draw loop line as bold","dirauxmark.tool":"Enable to input aux mark of direction","enline.tool":"Enable to draw line only between the points","lattice.tool":"Disable drawing segment passing over a lattice point","uramashu":"Change to Ura-Mashu","singlenum.tool":"Ensure that a region has a number","singleregion":"Ensure that only one tile is shaded in each region","forceallcell.tool":"Force each cell to have a number","snakebd":"Draw border around a snake","ensquare":"Enable to force drawing squares from a clue","keypopup.tool":"Input numbers by panel","irowake.tool":"Color each line","irowake.change":"Change the line colors","irowakeblk.tool":"Color each block","irowakeblk.change":"Change the block colors","dontpassallcell":"Lines need not pass all crossings","aquarium_regions":"Water in one region must have the same surface level","country_empty":"Areas don't have to be visited","voxas_tatami":"Tatami rules (no 4-way intersections)","tren_new":"All unused cells must be connected","nuriuzu_connect":"All shaded cells must be connected","bdwalk_height":"Maximum height is unknown","pentopia_transparent":"Transparent mode (clues may be shaded)","koburin_minesweeper":"Minesweeper mode (numbers include diagonal cells)","akichi_maximum":"Maximum numbers may be reduced","magnets_anti":"Anti-Magnets (adjacent poles of different magnets must be equal)","heyapin_overlap":"Pins must overlap 2 or more regions","variant":"This puzzle uses variant rules","time":"Time:","timer.menu":"Show timer","check":"Check","check.variant":"Check base type","undo":"<-","redo":"->","ansclear":"Erase answer","ansclear.confirm":"Do you want to erase the answer?","subclear":"Erase aux. marks","subclear.confirm":"Do you want to erase the auxiliary marks?","auxdelete.confirm":"Do you want to delete this piece?","encolorall":"Color up","flushexcell":"Flush clues","applypreset":"Replace bank","applypreset.title":"Replace bank","applypreset.submit":"Replace","dropblocks":"Drop blocks","outlineshaded":"Outline shaded cells","enterTrial":"Trial mode","acceptTrial":"Accept trial","rejectTrial":"Reject trial","enterFurtherTrial":"Enter further trial","newboard.title":"New Board","newboard.header":"Create New Board.","newboard.cols":"Cols","newboard.tawa.width":"Width (Yellows)","newboard.rows":"Rows","newboard.tawa.height":"Height","newboard.preset":"Preset","newboard.submit":"Create","urlinput.title":"Load from URL","urlinput.submit":"Load","urloutput.title":"Export URL","urloutput.kanpen":"Change to Kanpen URL","urloutput.heyaapp":"Change to Heyawake-Applet URL","urloutput.pzprv3e":"Change to PUZ-PRE v3 Re-Edit URL","fileopen.title":"Open File","fileopen.choose":"Choose file","filesave.title":"Save File","filesave.format":"File format","filesave.format.pzprv3":"Puz-Pre v3 format","filesave.format.penciltxt":"Pencilbox Text format","filesave.format.pencilxml":"Pencilbox XML format","filesave.filename":"Filename","filesave.submit":"Save","filesave.invalid":"The filename contains invalid characters.","imagesave.title":"Save Image","imagesave.filetype":"File format","imagesave.png":"PNG Format","imagesave.svg":"Vector Image (SVG)","imagesave.gif":"GIF Format","imagesave.jpeg":"jpeg Format","imagesave.webp":"webp Format","imagesave.filename":"Filename","imagesave.cellsize":"Image Size","imagesave.transparent":"Set background to transparent","imagesave.bank":"Include piece bank","imagesave.saveimage":"Download","imagesave.openimage":"Open in another window","imagesave.error":"Fail to Output the Image","adjust.title":"Board Dimension Resizer","adjust.header":"Adjust the board.","adjust.expand":"Expand","adjust.reduce":"Reduce","adjust.up":"Top","adjust.dn":"Bottom","adjust.lt":"Left","adjust.rt":"Right","turnflip.title":"Flip/Turn the board","turnflip.header":"Flip/Turn the board.","turnflip.turnl":"Turn left by 90 degree","turnflip.turnr":"Turn right by 90 degree","turnflip.flipy":"Flip upside down","turnflip.flipx":"Flip leftside right","turnflip.turnl.short":"↶","turnflip.turnr.short":"↷","turnflip.flipy.short":"⇅","turnflip.flipx.short":"⇄","dispsize.title":"Change size","dispsize.header":"Change the display size.","dispsize.cellsize":"Display size","dispsize.submit":"Change","about.title":"About puzz.link","about.pzv":"PUZ-PRE v3","about.author":"happa","network.title":"Network play","network.start":"Start","network.share":"Share this link to play with someone:","list.sort.date":"Sort by date","list.sort.alpha":"Sort alphabetically"},
	ja: {"editor":"エディタ","beforeunload":"盤面が更新されています。","completed":"正解です！","cancel":"キャンセル","close":"閉じる","delete":"削除","menu_file":"ファイル","newboard":"新規作成","urlinput":"URL入力","urloutput":"URL出力","fileopen":"ファイルを開く","filesave":"ファイル保存…","duplicate":"盤面の複製","imagesave":"画像を保存","menu_edit":"編集","adjust":"盤面の調整","turnflip":"反転・回転","menu_display":"表示","cellsize":"表示サイズ","cellsize.xs":"サイズ 極小","cellsize.s":"サイズ 小","cellsize.n":"サイズ 標準","cellsize.l":"サイズ 大","cellsize.xl":"サイズ 特大","cellsize.custom":"数値指定…","font":"フォント","font.sans":"ゴシック","font.serif":"明朝","dispqnumbg":"問題背景描画","undefcell":"未確定領域背景描画","cursor":"カーソルの表示","trialmarker":"仮置きマーカーの表示","adjsize":"自動横幅調節","fullwidth":"横幅最大拡張","toolarea.show":"ツールエリアを表示","toolarea.hide":"ツールエリアを隠す","menu_setting":"設定","lrinvert":"マウス左右反転","use_tri":"操作方法","use_tri.1":"クリックした位置","use_tri.2":"引っ張り入力","use_tri.3":"1ボタン","bgcolor.menu":"背景色入力","autoerr.menu.hitori":"重複した数字を表示","autoerr.menu.gokigen":"ループした斜線の色分け","multierr":"複数エラー検出","forceallcell.menu":"全マス数字必須","dirauxmark.menu":"方向の補助記号","enline.menu":"点を結ぶ線","lattice.menu":"格子点チェック","singlenum.menu":"領域に数字1つ","discolor":"色分け無効化","mouseonly":"マウス入力モードにする","autocheck":"正答判定","autocheck.off":"正答を自動で判定しない","autocheck.guarded":"自動(guarded)","autocheck.simple":"自動(常に)","menu_help":"ヘルプ","rules":"ルール","about":"puzz.linkについて","translate":"翻訳支援(Weblate)","issues":"バグレポートと機能リクエスト","mode":"モード","mode.edit":"問題入力モード","mode.play":"解答モード","use":"操作方法","use.1":"左右ボタン","use.2":"1ボタン","preset.pentominoes":"ペントミノ","preset.tetrominoes":"テトロミノ","preset.double_tetrominoes":"テトロミノ2つずつ","preset.copy_answer":"回答にあるものすべて","preset.zero":"ブロックなし","inputmode":"入力モード","inputmode.auto":"自動","inputmode.slide":"平行移動","inputmode.shade":"黒マス","inputmode.unshade":"白マス","inputmode.number":"数字","inputmode.number-":"数字(逆順)","inputmode.letter":"アルファベット","inputmode.letter-":"アルファベット(逆順)","inputmode.quesmark":"盤面記号","inputmode.quesmark-":"盤面記号(逆順)","inputmode.color":"色","inputmode.color-":"色(逆順)","inputmode.border":"境界線","inputmode.sub-border":"境界線(細線)","inputmode.subline":"補助線","inputmode.direc":"向き","inputmode.arrow":"矢印","inputmode.circle-unshade":"白まる","inputmode.circle-shade":"黒まる","inputmode.circle-gray":"灰まる","inputmode.goat":"ヤギ","inputmode.wolf":"オオカミ","inputmode.moon":"月","inputmode.sun":"太陽","inputmode.empty":"無効セル","inputmode.ice":"アイスバーン","inputmode.water":"ウォーターハザード","inputmode.nabe":"鍋","inputmode.box":"箱","inputmode.pin":"Pins","inputmode.crossdot":"黒点","inputmode.ineq":"不等号","inputmode.move-clue":"図形の移動","inputmode.copy-answer":"解答モードから記号作成","inputmode.mark-circle":"丸記号","inputmode.mark-triangle":"三角形","inputmode.mark-rect":"四角形","inputmode.mark-tree":"木","inputmode.mark-tent":"テント","inputmode.mark-cross":"バツ印","inputmode.undef":"？記号","inputmode.line":"線","inputmode.peke":"バツ印","inputmode.diraux":"線の向き補助記号","inputmode.bar":"線","inputmode.akari":"あかり","inputmode.star":"スター","inputmode.dot":"黒点","inputmode.balloon":"風船","inputmode.ironball":"鉄球","inputmode.futon":"ふとん","inputmode.completion":"確定数字","inputmode.copycircle":"コピー","inputmode.copynum":"コピー","inputmode.copyletter":"コピー","inputmode.dragnum+":"数字を増やしてコピー","inputmode.dragnum-":"数字を減らしてコピー","inputmode.objblank":"ドット","inputmode.numexist":"数字あり補助記号","inputmode.numblank":"数字なし補助記号","inputmode.subcircle":"補助丸記号","inputmode.subcross":"補助バツ記号","inputmode.bgcolor":"背景色1/2","inputmode.bgcolor1":"背景色1","inputmode.bgcolor2":"背景色2","inputmode.bgpaint":"下絵","inputmode.clear":"消去","inputmode.info-line":"線の繋がりチェック","inputmode.info-blk":"黒マス繋がりチェック","inputmode.info-ublk":"白マス繋がりチェック","inputmode.info-room":"へやの繋がりチェック","inputmode.info-road":"経路チェック","disptype":"表示形式","context_marks":"矢印を表示する","disptype_yajilin.1":"ニコリ紙面形式","disptype_yajilin.2":"背景色をグレーにする","disptype_bosanowa.1":"ニコリ紙面形式","disptype_bosanowa.2":"倉庫番形式","disptype_bosanowa.3":"ワリタイ形式","disptype_interbd.1":"色","disptype_interbd.2":"形","disptype_interbd.3":"色と形","dispmove":"動かしたように描画を行う","bgcolor.tool":"セルの中央をクリックした時に背景色の入力を有効にする","autocmp.number":"正しい数字をグレーにする","autocmp.room":"条件を満たした領域に背景色をつける","autocmp.akari":"光の照らす領域に背景色をつける","autocmp.kouchoku":"線が2本以上になったら点をグレーにする","autocmp.border":"異なる数字の間にグレーの境界線を引く","autoerr.tool.hitori":"重複している数字を赤くする","autoerr.tool.gokigen":"ループになっている斜線を赤くする","autoerr.tool.wagiri":"ループになっている斜線を太くする","dirauxmark.tool":"方向を表す補助記号を入力する","enline.tool":"点の間のみ線を引けるようにする","lattice.tool":"点を通過する線を引けないようにする","uramashu":"裏ましゅにする","singlenum.tool":"領域に一つだけ数字を入力できるようにする","singleregion":"各領域で黒く塗れるタイルを1つだけにする","forceallcell.tool":"全てのマスに数字が入った場合のみ正解とする","ensquare":"黒丸がある場所からだけ正方形を描けるようにする","snakebd":"へびの周りに境界線を表示する","keypopup.tool":"数字・記号をパネルで入力する","irowake.tool":"線の色分けをする","irowake.change":"色分けしなおす","irowakeblk.tool":"黒マスの色分けをする","irowakeblk.change":"色分けしなおす","dontpassallcell":"線が全ての交差点を通過していない場合も正解とする","aquarium_regions":"同一領域内の水面の高さがすべて等しい場合のみ正解とする","country_empty":"線が全く通らない国があっても正解とする","voxas_tatami":"タタミルール(境界の十字交差禁止)","tren_new":"白マスひとつながりルールを追加","nuriuzu_connect":"黒マスひとつながりルールを追加","bdwalk_height":"盤面にある数字より大きい階数があってもよい","pentopia_transparent":"Transparent (矢印のマスが黒マスになる場合もあります。)","koburin_minesweeper":"マインスイーパモード (数字は斜めのマスを含みます)","akichi_maximum":"最大値が数字より小さくても可","magnets_anti":"Anti-Magnets (磁石が必ず同じ極で隣り合う)","heyapin_overlap":"ピンは必ず複数の部屋にまたがる","variant":"変種ルール","time":"経過時間：","timer.menu":"タイマーを表示","check":"チェック","check.variant":"本家ルールでチェック","undo":"戻","redo":"進","ansclear":"解答消去","ansclear.confirm":"解答を消去しますか？","subclear":"補助消去","subclear.confirm":"補助記号を消去しますか？","auxdelete.confirm":"このブロックを削除しますか？","encolorall":"色をつける","flushexcell":"ヒントを揃える","applypreset":"ブロックの変更","applypreset.title":"ブロックの変更","applypreset.submit":"OK","dropblocks":"ブロックを落とす","enterTrial":"仮置きモード","acceptTrial":"仮置き確定","rejectTrial":"仮置き破棄","enterFurtherTrial":"多重仮置き","newboard.title":"盤面の新規作成","newboard.header":"盤面を新規作成します。","newboard.cols":"よこ","newboard.tawa.width":"横幅 (黄色の数)","newboard.rows":"たて","newboard.tawa.height":"高さ","newboard.preset":"ブロック","newboard.submit":"新規作成","urlinput.title":"URL入力","urlinput.submit":"読み込む","urloutput.title":"URL出力","urloutput.kanpen":"カンペンのURLを出力する","urloutput.heyaapp":"へやわけアプレットのURLを出力する","urloutput.pzprv3e":"ぱずぷれv3の再編集用URLを出力する","fileopen.title":"ファイルを開く","fileopen.choose":"ファイル選択","filesave.title":"ファイルを保存する","filesave.format":"ファイル形式","filesave.format.pzprv3":"ファイル形式","filesave.format.penciltxt":"pencilbox形式","filesave.format.pencilxml":"pencilbox XML形式","filesave.filename":"ファイル名","filesave.submit":"保存","filesave.invalid":"ファイル名として使用できない文字が含まれています。","imagesave.title":"画像を保存する","imagesave.filetype":"ファイル形式","imagesave.png":"PNG形式","imagesave.svg":"ベクター画像(SVG)","imagesave.gif":"GIF形式","imagesave.jpeg":"jpeg形式","imagesave.webp":"webp形式","imagesave.filename":"ファイル名","imagesave.cellsize":"画像のサイズ","imagesave.transparent":"背景色を透明にする","imagesave.bank":"ブロックを含める","imagesave.saveimage":"ダウンロード","imagesave.openimage":"別ウィンドウで開く","imagesave.error":"画像の出力に失敗しました","adjust.title":"盤面の調整","adjust.header":"盤面の調整を行います。","adjust.expand":"拡大","adjust.reduce":"縮小","adjust.up":"上","adjust.dn":"下","adjust.lt":"左","adjust.rt":"右","turnflip.title":"反転・回転","turnflip.header":"盤面の回転・反転を行います。","turnflip.turnl":"左90°回転","turnflip.turnr":"右90°回転","turnflip.flipy":"上下反転","turnflip.flipx":"左右反転","turnflip.turnl.short":"↶","turnflip.turnr.short":"↷","turnflip.flipy.short":"⇅","turnflip.flipx.short":"⇄","dispsize.title":"表示サイズの変更","dispsize.header":"表示サイズを変更します。","dispsize.cellsize":"表示サイズ","dispsize.submit":"変更する","about.title":"puzz.linkについて","about.pzv":"ぱずぷれv3","about.author":"は はっぱ/連続発破","network.title":"ネットワークプレイ","network.start":"始める","network.share":"共有用URL:","inputmode.copysymbol":"コピー","preset.fleet3":"サイズ3","preset.fleet4":"サイズ4","preset.fleet5":"サイズ5","patchwork_leftaux":"左クリックで補助線を入力する","list.sort.date":"日付順","list.sort.alpha":"アルファベット順"}
};

// Event.js v3.4.0
/* global _doc:readonly */

//---------------------------------------------------------------------------
// ★UIEventsクラス イベント設定の管理を行う
//---------------------------------------------------------------------------
// メニュー描画/取得/html表示系
ui.event = {
	resizetimer: null, // resizeタイマー
	visibilitystate: null,

	visibilityCallbacks: [],

	removers: [],

	//----------------------------------------------------------------------
	// event.addEvent()        addEventListener(など)を呼び出す
	//----------------------------------------------------------------------
	addEvent: function(el, event, self, callback, capt) {
		this.removers.push(pzpr.util.addEvent(el, event, self, callback, !!capt));
	},

	//----------------------------------------------------------------------
	// event.removeAllEvents() addEventで登録されたイベントを削除する
	//----------------------------------------------------------------------
	removeAllEvents: function() {
		this.removers.forEach(function(remover) {
			remover();
		});
		this.removers = [];
	},

	addVisibilityCallback: function(callback) {
		if (this.visibilitystate === "visible") {
			callback();
		} else {
			this.visibilityCallbacks.push(callback);
		}
	},

	//---------------------------------------------------------------------------
	// event.setWindowEvents()  マウス入力、キー入力以外のイベントの設定を行う
	//---------------------------------------------------------------------------
	setWindowEvents: function() {
		// File API＋Drag&Drop APIの設定
		if (!!ui.reader) {
			var DDhandler = function(e) {
				ui.reader.readAsText(e.dataTransfer.files[0]);
				e.preventDefault();
				e.stopPropagation();
			};
			this.addEvent(
				window,
				"dragover",
				this,
				function(e) {
					e.preventDefault();
				},
				true
			);
			this.addEvent(window, "drop", this, DDhandler, true);
		}

		// onBlurにイベントを割り当てる
		this.addEvent(_doc, "blur", this, this.onblur_func);

		// onresizeイベントを割り当てる
		var evname = !pzpr.env.OS.iOS ? "resize" : "orientationchange";
		this.addEvent(window, evname, this, this.onresize_func);

		// onbeforeunloadイベントを割り当てる
		this.addEvent(window, "beforeunload", this, this.onbeforeunload_func);

		// onunloadイベントを割り当てる
		this.addEvent(window, "unload", this, this.onunload_func);

		if (!!matchMedia) {
			var mqString = "(resolution: 1dppx)";
			matchMedia(mqString).addListener(this.onpixelratiochange_func);
		}
	},

	setDocumentEvents: function() {
		this.addEvent(
			document,
			"visibilitychange",
			this,
			this.onvisibilitychange_func
		);
		this.onvisibilitychange_func(); // set state
	},

	//---------------------------------------------------------------------------
	// event.onload_func()   ウィンドウを開いた時に呼ばれる関数
	// event.onunload_func() ウィンドウをクローズする前に呼ばれる関数
	//---------------------------------------------------------------------------
	onload_func: function(onload_option) {
		ui.initFileReadMethod();

		ui.urlconfig.init(onload_option);
		ui.menuconfig.restore();

		ui.listener.setListeners(ui.puzzle);

		if (pzpr.env.OS.Android) {
			ui.misc.modifyCSS({
				"body, .btn": { fontFamily: "Verdana, Arial, sans-serif" }
			});
		}
	},
	onunload_func: function() {
		ui.menuconfig.save();
	},

	//---------------------------------------------------------------------------
	// event.onresize_func() ウィンドウリサイズ時に呼ばれる関数
	// event.onblur_func()   ウィンドウからフォーカスが離れた時に呼ばれる関数
	// event.onbeforeunload_func()  ウィンドウをクローズする前に呼ばれる関数
	//---------------------------------------------------------------------------
	onresize_func: function() {
		if (this.resizetimer) {
			clearTimeout(this.resizetimer);
		}
		this.resizetimer = setTimeout(function() {
			ui.adjustcellsize();
		}, 250);
	},
	onblur_func: function() {
		ui.puzzle.key.keyreset();
		ui.puzzle.mouse.mousereset();
	},
	onbeforeunload_func: function(e) {
		if (ui.puzzle.playeronly || !ui.puzzle.ismodified()) {
			return;
		}

		var msg = ui.i18n("beforeunload");
		e.returnValue = msg;
		return msg;
	},

	onvisibilitychange_func: function(e) {
		var state = document.visibilityState;
		if (state !== this.visibilitystate) {
			this.visibilitystate = state;
			if (state === "visible") {
				for (var i = 0; i < this.visibilityCallbacks.length; i++) {
					this.visibilityCallbacks[i]();
				}
				this.visibilityCallbacks = [];
			}
		}
	},

	onpixelratiochange_func: function(e) {
		ui.puzzle.redraw(true);
	}
};

// Listener.js v3.4.1

//---------------------------------------------------------------------------
// ★UIListener Puzzleに付加するListenerイベント設定の管理を行う
//  注意：execListenerで呼び出される関数は、thisがui.listenerになっていません
//---------------------------------------------------------------------------
ui.listener = {
	//---------------------------------------------------------------------------
	// listener.setListeners()  PuzzleのListenerを登録する
	//---------------------------------------------------------------------------
	setListeners: function(puzzle) {
		puzzle.once("ready", this.onFirstReady);
		puzzle.on("ready", this.onReady);

		puzzle.on("key", this.onKeyInput);
		puzzle.on("mouse", this.onMouseInput);
		puzzle.on("history", this.onHistoryChange);
		puzzle.on("trial", this.onTrialModeChange);
		puzzle.on("mode", this.onModeChange);

		puzzle.on("adjust", this.onAdjust);
		puzzle.on("resize", this.onResize);

		puzzle.on("cellop", this.onCellOp);
	},

	//---------------------------------------------------------------------------
	// listener.onFirstReady() 初回のパズル読み込み完了時に呼び出される関数
	// listener.onReady()  パズル読み込み完了時に呼び出される関数
	//---------------------------------------------------------------------------
	onFirstReady: function(puzzle) {
		ui.initImageSaveMethod(puzzle);
		ui.timer.init();
	},
	onReady: function(puzzle) {
		/* パズルの種類が同じならMenuArea等の再設定は行わない */
		if (ui.currentpid !== puzzle.pid) {
			/* 以前設定済みのイベントを削除する */
			ui.event.removeAllEvents();

			/* menuareaより先に キーポップアップを作成する必要がある */
			ui.keypopup.create();

			/* メニュー用の設定を消去・再設定する */
			ui.menuarea.reset();
			ui.toolarea.reset();
			ui.popupmgr.reset();
			ui.notify.reset();
			ui.misc.displayDesign();

			/* Windowへのイベント設定 */
			ui.event.setWindowEvents();
			ui.event.setDocumentEvents();
		}

		ui.menuconfig.sync();
		ui.menuconfig.set(
			"autocheck_once",
			ui.menuconfig.get("autocheck_mode") !== "off" && ui.puzzle.playeronly
		);
		ui.currentpid = puzzle.pid;

		ui.adjustcellsize();
		ui.keypopup.display();

		ui.event.addVisibilityCallback(function() {
			ui.timer.start();
		});

		ui.network.start();
	},

	//---------------------------------------------------------------------------
	// listener.onKeyInput()    キー入力時に呼び出される関数 (return false = 処理をキャンセル)
	// listener.onMouseInput()  盤面へのマウス入力時に呼び出される関数 (return false = 処理をキャンセル)
	//---------------------------------------------------------------------------
	onKeyInput: function(puzzle, c) {
		var kc = puzzle.key,
			ut = ui.undotimer,
			result = true;
		if (kc.keydown) {
			/* TimerでUndo/Redoする */
			if (c === "ctrl+z" || c === "meta+z") {
				ut.startUndo();
				result = false;
			}
			if (c === "ctrl+y" || c === "meta+y") {
				ut.startRedo();
				result = false;
			}

			/* F2で回答モード Shift+F2で問題作成モード */
			if (!puzzle.playeronly) {
				if (puzzle.editmode && c === "F2") {
					ui.menuconfig.set("mode", puzzle.MODE_PLAYER);
					result = false;
				} else if (puzzle.playmode && c === "shift+F2") {
					ui.menuconfig.set("mode", puzzle.MODE_EDITOR);
					result = false;
				}
			}
		} else if (kc.keyup) {
			/* TimerのUndo/Redoを停止する */
			ut.stop();
		}

		kc.cancelEvent = !result;
	},
	onMouseInput: function(puzzle) {
		var mv = puzzle.mouse,
			result = true;
		if (mv.mousestart && mv.btn === "middle") {
			/* 中ボタン */
			ui.menuconfig.set("mode", puzzle.playmode ? "edit" : "play");
			mv.mousereset();
			result = false;
		}

		mv.cancelEvent = !result;
	},

	//---------------------------------------------------------------------------
	// listener.onHistoryChange() 履歴変更時に呼び出される関数
	// listener.onTrialModeChange() 仮置きモード変更時に呼び出される関数
	// listener.onModeChange()      Mode変更時に呼び出される関数
	//---------------------------------------------------------------------------
	onHistoryChange: function(puzzle) {
		if (!!ui.currentpid) {
			ui.setdisplay("operation");
		}
	},
	onTrialModeChange: function(puzzle, trialstage) {
		if (!!ui.currentpid) {
			ui.setdisplay("trialmode");
		}
	},
	onModeChange: function(puzzle) {
		ui.menuconfig.list.mode.val = ui.puzzle.playmode ? "play" : "edit";
		ui.setdisplay("mode");
		ui.menuconfig.set("inputmode", ui.puzzle.mouse.inputMode);

		ui.setdisplay("keypopup");
		ui.setdisplay("bgcolor");
		ui.setdisplay("mouseonly");
		for (var key in ui.puzzle.config.getVariants()) {
			ui.setdisplay(key);
		}
		ui.keypopup.display();
	},

	//---------------------------------------------------------------------------
	// listener.onAdjust()  盤面の大きさが変わったときの処理を呼び出す
	//---------------------------------------------------------------------------
	onAdjust: function(puzzle) {
		ui.adjustcellsize();
	},

	//---------------------------------------------------------------------------
	// listener.onResize()  canvasのサイズを変更したときの処理を呼び出す
	//---------------------------------------------------------------------------
	onResize: function(puzzle) {
		var pc = puzzle.painter,
			cellsize = Math.min(pc.cw, pc.ch);
		var val = (ui.getBoardPadding() * cellsize) | 0,
			valTop = val;
		if (puzzle.pid === "starbattle" || puzzle.pid === "easyasabc") {
			valTop = ((0.05 * cellsize) | 0) + "px";
		}
		puzzle.canvas.parentNode.style.padding = val + "px";
		puzzle.canvas.parentNode.style.paddingTop = valTop + "px";

		ui.keypopup.resizepanel();
	},

	onCellOp: function(puzzle, op) {
		ui.network.onCellOp(op);
	}
};

// MenuConfig.js v3.4.1

(function() {
	//---------------------------------------------------------------------------
	// ★MenuConfigクラス UI側の設定値を管理する
	//---------------------------------------------------------------------------
	var Config = pzpr.Puzzle.prototype.Config.prototype;

	// メニュー描画/取得/html表示系
	// Menuクラス
	ui.menuconfig = {
		list: null, // MenuConfigの設定内容を保持する
		puzzle: null,

		//---------------------------------------------------------------------------
		// menuconfig.init()  MenuConfigの初期化を行う
		// menuconfig.add()   初期化時に設定を追加する
		//---------------------------------------------------------------------------
		init: function() {
			this.list = {};

			/* 正解自動判定機能 */
			this.add("autocheck_mode", "simple", {
				option: ["off", "simple", "guarded"]
			});

			/* per-solve autocheck status, turned off when complete */
			this.add("autocheck_once", ui.puzzle.playeronly, {
				volatile: true
			});

			this.add("keypopup", false); /* キーポップアップ (数字などのパネル入力) */

			this.add("adjsize", true); /* 自動横幅調節 */
			this.add(
				"cellsizeval",
				ui.windowWidth() <= 960 ? 36 : 48
			); /* セルのサイズ設定用 */
			this.add(
				"fullwidth",
				ui.windowWidth() < 600
			); /* キャンバスを横幅いっぱいに広げる */

			this.add("toolarea", true); /* ツールエリアの表示 */

			this.add("inputmode", "auto", { volatile: true }); /* inputMode */
			this.add("auxeditor_inputmode", "auto", { volatile: true });

			this.add("lrinvert", false, {
				volatile: true
			}); /* マウスの左右ボタンを反転する設定 */

			this.add("language", pzpr.lang, { option: ["en", "ja"] }); /* 言語設定 */

			/* puzzle.configを一括で扱うため登録 */
			this.puzzle = ui.puzzle;
			for (var name in ui.puzzle.config.list) {
				var item = ui.puzzle.config.list[name],
					extoption = { puzzle: true };
				for (var field in item.extoption) {
					extoption[field] = item[field];
				}
				this.add(name, item.defval, extoption);
			}
			this.add("mode", !ui.puzzle.playmode ? "edit" : "play", {
				option: ["edit", "play"],
				puzzle: true
			});
		},
		add: function(name, defvalue, extoption) {
			Config.add.call(this, name, defvalue, extoption);
			if (!!extoption && extoption.puzzle) {
				var item = this.list[name];
				item.volatile = item.puzzle = true;
			}
		},

		//---------------------------------------------------------------------------
		// menuconfig.sync()  URL形式などによって変化する可能性がある設定値を同期する
		//---------------------------------------------------------------------------
		sync: function() {
			var dirty = this.isDirty;
			var idname = [];
			switch (ui.puzzle.pid) {
				case "yajilin":
				case "lixloop":
					idname = "disptype_yajilin";
					break;
				case "bosanowa":
					idname = "disptype_bosanowa";
					break;
				case "interbd":
					idname = "disptype_interbd";
					break;
				case "arukone":
					idname = "dontpassallcell";
					break;
				case "aquarium":
					idname = "aquarium_regions";
					break;
				case "country":
					idname = "country_empty";
					break;
				case "voxas":
					idname = "voxas_tatami";
					break;
				case "tren":
				case "news":
					idname = "tren_new";
					break;
				case "nuriuzu":
					idname = "nuriuzu_connect";
					break;
				case "pentopia":
					idname = "pentopia_transparent";
					break;
				case "koburin":
					idname = ["disptype_yajilin", "koburin_minesweeper"];
					break;
				case "akichi":
					idname = "akichi_maximum";
					break;
				case "magnets":
					idname = "magnets_anti";
					break;
				case "context":
					idname = "context_marks";
					break;
				case "heyapin":
					idname = "heyapin_overlap";
					break;
				case "bdwalk":
					idname = "bdwalk_height";
					break;
			}

			if (typeof idname === "string") {
				idname = [idname];
			}
			for (var i in idname) {
				this.set(idname[i], ui.puzzle.getConfig(idname[i]));
			}

			this.set("variant", ui.puzzle.getConfig("variant"));
			this.set("lrinvert", ui.puzzle.mouse.inversion);
			this.set("autocmp", ui.puzzle.getConfig("autocmp"));
			this.set("autoerr", ui.puzzle.getConfig("autoerr"));

			this.isDirty = dirty;
		},

		//---------------------------------------------------------------------------
		// menuconfig.getCurrentName()  指定されたidを現在使用している名前に変換する
		//---------------------------------------------------------------------------
		getCurrentName: Config.getCurrentName,
		getNormalizedName: Config.getNormalizedName,

		//---------------------------------------------------------------------------
		// menuconfig.get()  各フラグの設定値を返す
		// menuconfig.get()  各フラグの設定値を返す
		// menuconfig.reset() 各フラグの設定値を初期化する
		//---------------------------------------------------------------------------
		get: Config.get,
		set: function(argname, newval) {
			var names = this.getNormalizedName(argname),
				idname = names.name;
			if (!this.list[idname]) {
				return;
			}

			if (idname === "mode" || idname === "inputmode") {
				ui.auxeditor.close();
			}

			if (idname === "mode") {
				ui.puzzle.setMode(newval);
				newval = !ui.puzzle.playmode ? "edit" : "play";
			} else if (idname === "inputmode") {
				ui.puzzle.mouse.setInputMode(newval);
				newval = ui.puzzle.mouse.inputMode;
			} else if (idname === "auxeditor_inputmode") {
				ui.auxeditor.puzzle.mouse.setInputMode(newval);
				newval = ui.auxeditor.puzzle.mouse.inputMode;
			}

			newval = this.setproper(names, newval);

			if (idname === "language") {
				pzpr.lang = newval;
			} else if (this.list[idname].puzzle) {
				ui.puzzle.setConfig(argname, newval);
			}
			if (
				!this.list[idname].volatile ||
				(ui.puzzle.config.list[argname] &&
					!ui.puzzle.config.list[argname].volatile)
			) {
				this.isDirty = true;
			}

			this.configevent(idname, newval);
		},
		reset: Config.reset,

		//---------------------------------------------------------------------------
		// menuconfig.restore()  保存された各種設定値を元に戻す
		// menuconfig.save()     各種設定値を保存する
		//---------------------------------------------------------------------------
		restore: function() {
			/* 設定が保存されている場合は元に戻す */
			ui.puzzle.config.init();
			this.init();
			var json_puzzle = localStorage.getItem("pzprv3_config:puzzle");
			var json_menu = localStorage.getItem("pzprv3_config:ui");
			if (!!json_puzzle) {
				this.setAll(JSON.parse(json_puzzle));
			}
			if (!!json_menu) {
				this.setAll(JSON.parse(json_menu));
			}
			this.isDirty = false;
		},
		isDirty: false,
		save: function() {
			if (!this.isDirty) {
				return;
			}

			try {
				localStorage.setItem(
					"pzprv3_config:puzzle",
					JSON.stringify(ui.puzzle.saveConfig())
				);
				localStorage.setItem("pzprv3_config:ui", JSON.stringify(this.getAll()));
			} catch (ex) {
				console.warn(ex);
			}
			this.isDirty = false;
		},

		//---------------------------------------------------------------------------
		// menuconfig.getList()  現在有効な設定値のリストを返す
		//---------------------------------------------------------------------------
		getList: Config.getList,
		getexec: function(name) {
			if (!this.list[name]) {
				return false;
			}
			if (name === "mode") {
				return !ui.puzzle.playeronly;
			} else if (this.list[name].puzzle) {
				return ui.puzzle.validConfig(name);
			}
			return true;
		},

		//---------------------------------------------------------------------------
		// menuconfig.getAll()  全フラグの設定値を返す
		// menuconfig.setAll()  全フラグの設定値を設定する
		//---------------------------------------------------------------------------
		getAll: Config.getAll,
		setAll: function(setting) {
			for (var key in setting) {
				this.set(key, setting[key]);
			}
			this.list.autocheck_once.val = this.list.autocheck_mode.val !== "off";
		},

		//---------------------------------------------------------------------------
		// menuconfig.setproper()    設定値の型を正しいものに変換して設定変更する
		// menuconfig.valid()        設定値が有効なパズルかどうかを返す
		//---------------------------------------------------------------------------
		setproper: Config.setproper,
		valid: function(idname) {
			if (!this.list[idname]) {
				return false;
			}
			if (idname === "keypopup") {
				return ui.keypopup.paneltype[1] !== 0 || ui.keypopup.paneltype[3] !== 0;
			} else if (idname === "mode") {
				return !ui.puzzle.playeronly;
			} else if (idname === "timer") {
				return ui.puzzle.playeronly;
			} else if (idname === "inputmode") {
				return (
					ui.puzzle.mouse.getInputModeList("play").length > 1 ||
					(!ui.puzzle.playeronly &&
						ui.puzzle.mouse.getInputModeList("edit").length > 1)
				);
			} else if (idname === "autocheck_mode" || idname === "autocheck_once") {
				return ui.puzzle.playeronly && !ui.puzzle.getConfig("variant");
			} else if (this.list[idname].puzzle) {
				return ui.puzzle.validConfig(idname);
			}
			return true;
		},

		//---------------------------------------------------------------------------
		// config.configevent()  設定変更時の動作を記述する (modeはlistener.onModeChangeで変更)
		//---------------------------------------------------------------------------
		configevent: function(idname, newval) {
			if (!ui.menuarea.menuitem) {
				return;
			}
			ui.setdisplay(idname);
			switch (idname) {
				case "keypopup":
					ui.keypopup.display();
					break;

				case "adjsize":
				case "cellsizeval":
				case "fullwidth":
					ui.adjustcellsize();
					break;

				case "autocheck_mode":
					this.list.autocheck_once.val = newval !== "off";
					break;

				case "timer":
					ui.toolarea.display();
					break;
				case "language":
					ui.displayAll();
					break;

				case "lrinvert":
					ui.puzzle.mouse.setInversion(newval);
					break;
			}
		}
	};
})();

(function() {
	ui.urlconfig = {
		embed: false,

		init: function(onload_option) {
			if (onload_option.embed === "yes") {
				this.embed = true;
			}
		}
	};
})();

// Misc.js v3.4.1
/* global _doc:readonly */

//---------------------------------------------------------------------------
// ★Miscクラス html表示系 (Menu, Button以外)の制御を行う
//---------------------------------------------------------------------------
ui.misc = {
	//---------------------------------------------------------------------------
	// misc.displayDesign()  背景画像とかtitle・背景画像・html表示の設定
	// misc.bgimage()        背景画像を返す
	//---------------------------------------------------------------------------
	displayDesign: function() {
		var pid = ui.puzzle.pid;
		var pinfo = pzpr.variety(pid);
		var title = ui.selectStr(pinfo.ja, pinfo.en);
		title += ui.puzzle.playeronly ? " player" : " " + ui.i18n("editor");

		_doc.title = title;
		var titleEL = _doc.getElementById("title2");
		titleEL.innerHTML = title;

		if (ui.urlconfig.embed) {
			_doc.body.style.background = "white";
		} else {
			_doc.body.style.backgroundImage = "url(" + this.bgimage(pid) + ")";
		}
	},
	bgimage: function(pid) {
		return toBGimage(pid);
	},

	//--------------------------------------------------------------------------------
	// misc.modifyCSS()   スタイルシートの中身を変更する
	//--------------------------------------------------------------------------------
	modifyCSS: function(input) {
		var sheet = _doc.styleSheets[0];
		var rules = sheet.cssRules;
		if (rules === null) {
		} // Chromeでローカルファイルを開くとおかしくなるので、とりあえず何もしないようにします
		else if (!this.modifyCSS_sub(rules, input)) {
			var sel = "";
			for (sel in input) {
				break;
			}
			sheet.insertRule("" + sel + " {}", rules.length);
			rules = sheet.cssRules;
			this.modifyCSS_sub(rules, input);
		}
	},
	modifyCSS_sub: function(rules, input) {
		var modified = false;
		for (var i = 0, len = rules.length; i < len; i++) {
			var rule = rules[i];
			if (!rule.selectorText) {
				continue;
			}
			var pps = input[rule.selectorText];
			if (!!pps) {
				for (var p in pps) {
					if (!!pps[p]) {
						rule.style[p] = pps[p];
					}
				}
				modified = true;
			}
		}
		return modified;
	},

	//--------------------------------------------------------------------------------
	// misc.walker()        DOMツリーをたどる
	// misc.displayByPid()  要素のdata-pid, autocmp-typeカスタム属性によって表示するしないを切り替える
	//--------------------------------------------------------------------------------
	walker: function(parent, func) {
		var els = [parent.firstChild];
		while (els.length > 0) {
			var el = els.pop();
			func(el);
			if (!!el.nextSibling) {
				els.push(el.nextSibling);
			}
			if (el.nodeType === 1 && el.childNodes.length > 0) {
				els.push(el.firstChild);
			}
		}
	},
	displayByPid: function(parent) {
		ui.misc.walker(parent, function(el) {
			if (el.nodeType === 1) {
				var disppid = ui.customAttr(el, "dispPid");
				if (!!disppid) {
					el.style.display = pzpr.util.checkpid(disppid, ui.puzzle.pid)
						? ""
						: "none";
				}
				var autocmp = ui.customAttr(el, "autocmpType");
				if (!!autocmp) {
					el.style.display =
						ui.puzzle.painter.autocmp === autocmp ? "" : "none";
				}
			}
		});
	}
};

function toBGimage(pid) {
	var imgs = [
		"akichi",
		"alter",
		"angleloop",
		"aquapelago",
		"aquarium",
		"araf",
		"skyscrapers",
		"balance",
		"battleship",
		"bdwalk",
		"brownies",
		"castle",
		"cbanana",
		"chainedb",
		"circlesquare",
		"cocktail",
		"coffeemilk",
		"compass",
		"coral",
		"cts",
		"curvedata",
		"dbchoco",
		"detour",
		"dominion",
		"doppelblock",
		"dotchi",
		"doubleback",
		"easyasabc",
		"evolmino",
		"genderwalk",
		"geradeweg",
		"heteromino",
		"heyapin",
		"icewalk",
		"invlitso",
		"ladders",
		"lixloop",
		"kaidan",
		"kaisu",
		"kissing",
		"kropki",
		"kuroclone",
		"lollipops",
		"magnets",
		"mannequin",
		"martini",
		"maxi",
		"midloop",
		"mirrorbk",
		"moonsun",
		"mrtile",
		"mukkonn",
		"nanameguri",
		"nondango",
		"nonogram",
		"norinuri",
		"nurimisaki",
		"nuriuzu",
		"nothing",
		"oneroom",
		"ovotovata",
		"oyakodori",
		"patchwork",
		"pencils",
		"pentatouch",
		"pentopia",
		"pmemory",
		"portal",
		"ququ",
		"rassi",
		"remlen",
		"retroships",
		"roundtrip",
		"sashikazune",
		"satogaeri",
		"scrin",
		"simplegako",
		"simpleloop",
		"slashpack",
		"snake",
		"squarejam",
		"starbattle",
		"statuepark",
		"subomino",
		"wafusuma",
		"symmarea",
		"tachibk",
		"tajmahal",
		"takoyaki",
		"tapaloop",
		"tents",
		"teri",
		"tetrochain",
		"tetrominous",
		"tontonbeya",
		"trainstations",
		"tslither",
		"voxas",
		"vslither",
		"walllogic",
		"waterwalk",
		"wittgen",
		"yinyang"
	];
	if (imgs.indexOf(pid) >= 0) {
		return "img/" + pid + ".png";
	}
	var header;
	var data = {
		/* カラーパレットが2色時のHeader(途中まで), 16×16サイズのData Block(途中から) */
		aho: ["ICAgKCgoC", "I4Qdp3vJDxwMtNorV85sQ6RwWhhiZPNF57Q+3udgcjWmLVMAADs="],
		amibo: ["P/AwP///y", "HoRjqQvI36AKtNrrolx5Hz+BXjeKX4KlVWmSmyt1BQA7"],
		ayeheya: ["P/ow////y", "F4SPGJEN66KctNoGaZ5b9guGIsdoZVUAADs="],
		cave: [
			"P+vg///wC",
			"JYRjl4DbmlqYtNr3mFs67g+FYiZd5uSlYjdyJNim56mytv3CeQEAOw=="
		],
		barns: [
			"MDAwID//y",
			"JQyCqZa369hTDtg7cYxT+r51zUVyWSMiYbqKJZl65tOCqDHjZQEAOw=="
		],
		bdblock: [
			"Dn/pP///y",
			"IoyPqQHb+lJE81RzmdsMeI994EKWJsVJKQqtlouFovydSgEAOw=="
		],
		bonsan: [
			"P//wMD/wC",
			"JoSPicGqcWCSgBpbJWa81zlR4hNizomeHMh+1wZ2MtssrTmmmVQAADs="
		],
		box: ["ICAgKCgoC", "IgyOCaadxpyKEkHqKH5tLxmEondg5MeBU2WyKziGakfPRwEAOw=="],
		cbblock: ["P/QQf///y", "H4wDp3vJj+BzUlEIst784rp4lSiRH9igKdNpk2qYRwEAOw=="],
		chocona: ["P/AwP///y", "IIyPGcDtD1BUM1WpVr6HG69R2yiWFnmamNqh0Ntk8iwXADs="],
		cojun: [
			"MD//////y",
			"I4wfgMvKD+Jrcp6IrcF18ux9DiWOSNldaJqspgu28AZndVYAADs="
		],
		country: ["P/Gif///y", "IISPGZFtDKB7SDZL78RYna6BjhhO1WdG3siubWZC5FkAADs="],
		creek: [
			"AD//8H+/y",
			"JIQfGces2tyD8RkrU16XboBVExd1YTmSjXWa5NlirTsjU/k1BQA7"
		],
		factors: ["AD//////y", "IISPqcsWHxp4iKq4cGXayd5dWwN+SXigqHeBawpJ8pwUADs="],
		fillmat: [
			"P//wLP/gS",
			"JoSDAam2yh6SM9pbE4UaT3d0HrWRmDOiXMZ+oLfG5cjIMAnOIlsAADs="
		],
		fillomino: [
			"ODg4P///y",
			"I4QPgcvKn4KU0DhbE7qP3wl608FtDVRq3bkuYZillYxmLlQAADs="
		],
		firefly: [
			"ID/gP//wC",
			"JISDpqvRzNySME2EMaAHzuddXEiWlVVSYxRl7riCsqeaG2orBQA7"
		],
		fivecells: [
			"MD/wP///y",
			"IwyOmWbqDaCLCgY7T5NT8vV02fdpYpVRSAmqZ4S145rS7FMAADs="
		],
		fourcells: [
			"MD/wP///y",
			"JoSPELeZrdxjoUJbmTYQ3T1xoEdh1gh+jhqtaZlxGOqK0nvL5o4VADs="
		],
		goishi: [
			"P/zwf///y",
			"JoSPiRHK2UA0cU5JVz5V79stFzUq5oly5eOBG8a9sAu/4QetZXoUADs="
		],
		gokigen: ["OD/g////y", "HYQPgafbvlKUMD42r9HbZg9W4oh9IdmZaLpSLZcUADs="],
		hakoiri: [
			"MD//////y",
			"KISPicEa+UyUYE5KLcSVY81FVyc1JYMq6oKm6zgu2zur8Eoesd6aSgEAOw=="
		],
		hanare: ["AD//////y", "FYSPqcvtDyMMdNLqLm46WC+F4kgmBQA7"],
		hashikake: [
			"P///8DAwC",
			"JoQflse829qLMlhLVYQuw8s5F+JtpTJSIKm2UgaAGBxrdI3TU1MAADs="
		],
		hebi: ["ID/gMD/wC", "FISPqcvtD1WYtM6Is96825pcHVQAADs="],
		herugolf: [
			"MD//+H//y",
			"I4SPiRHqwJ6KcrV6KIbXdqNlITeNo3Q+zMo67Ou+ayx/G1IAADs="
		],
		heyabon: [
			"P//wMD/wC",
			"LYyPacDtH9p5LgJ7IYt4V559Clh9Idad0kJ57caimmex7nqNUN2lti8JvSaAAgA7"
		],
		heyawake: ["MD/wP///y", "F4SPGJEN66KctNoGaZ5b9guGIsdoZVUAADs="],
		hitori: ["P//QP///y", "H4SPFhvpwNpDcVJ2lz11Q+x1HgduonVOZ/qwjpvASAEAOw=="],
		icebarn: ["EH9/////y", "F4SPqcvt3wJEcpp6g95cW/yAjmiV5nkWADs="],
		icelom: ["EH9/////y", "GYSPqcvdAYOblMl1UU7b9PN9XkWSkVimaQEAOw=="],
		icelom2: ["H///////y", "G4SPqcvNEQxsMVX71MWue7SBWjZyywSg38o2BQA7"],
		ichimaga: ["ODg4P///y", "IIyPGcDtfZ4EUdmLzWRxQ+1kovh0HgVO42qhy+nCHBsUADs="],
		ichimagam: ["ODg4P///y", "F4yPGcDtD6NTtFojs3639w1m3kiW5lUAADs="],
		ichimagax: ["ODg4P///y", "HkSOicDtDyNUtNHKltzcXXsloNKVm2aEqHqYbsQuBQA7"],
		juosan: ["Pjzu9/bqC", "H4SPEMm43R5MUoWLZZ1mcz+BIDRGHHU6ToYdJfOiZwEAOw=="],
		kaero: [
			"P/A/////y",
			"KIyPecDtbUB4dE5JIbtSxa1VISaC5sOlmXo6LImOnCt77BxjuPhlbgEAOw=="
		],
		kazunori: [
			"KD/wND/4C",
			"IwyOqaaN7BqMKdiL86xU9vVx4bEtFklBRglcj4a1T0qe9AgUADs="
		],
		kakuro: ["ICAgP///y", "F4SPqcut4V5McJ5qAbZ79vg5YTNmZlYAADs="],
		kakuru: ["MD/wP///y", "HYSPqcut4QA8c1Vq2ZWu7vxpERYmXmeKz6oaJVUAADs="],
		kinkonkan: [
			"P//gP///y",
			"JoSDAanmrKBbsDaL7ctoUuwdjBhSWxdyHod+bObCZyetiVuOo1MAADs="
		],
		kouchoku: ["ODg4P///y", "IIwDp3vJbxxccqraMKK6xX4BYDh+0SRSTLparevBsVwVADs="],
		kramma: ["ID/gMD/wC", "IISPGJFt6xqMitEzL8hv+Q+G4idZGkehkeqwpdbBj7wVADs="],
		kramman: ["ID/gMD/wC", "GYSPqcvtj4IMb85mbcy8+7xxGOho0ImmaQEAOw=="],
		kurochute: [
			"PDw8ODg4C",
			"IYSPFpGty9yBUD5qb9QVrER1GTaSUvWdadqILCKW2UzTBQA7"
		],
		kurodoko: ["ICAgMDAwC", "H4SPiRHqDaAzMk66Lraa1g6GIhNCn1Kd2aGubUKKSAEAOw=="],
		kurotto: [
			"MDAwODg4C",
			"KYxvoKuIzNKSD8gWMM2T12t5h+ZAncOZaoiu6LZFYtyRmGyHuPqmUF8AADs="
		],
		kusabi: [
			"MD/wP///y",
			"I4SPqZvh/06QaxoLMMK80uuBYvaRY3eWW6mxqjuuJwQx9r0UADs="
		],
		lightup: ["MD//////y", "IIRvgcvKDxycNAY5r6a6I99t2xdijVeN1bqYHJvA0VMAADs="],
		lits: ["ICAgKCgoC", "IYQRqXmNq9yBUT7alr1wU2Z9gfeRWFiip6RNKfs6otkdBQA7"],
		lookair: ["AD//6D//y", "GoSPqcsa/5qBUdIgwc07+w92jciQi+lQYFYAADs="],
		loopsp: [
			"P+AgP/Pgy",
			"KYwPeLtpzoCcVDb1Mg7QQb55T9VVGrOBaPqhHomY6iyG2EfCa7dep1EAADs="
		],
		loute: ["IH/gf///y", "IYyPaaDB+lJE89TVrssZ+Ph5zUiWG8ShqpSyK9V9Vmg2BQA7"],
		makaro: [
			"NnZ2e3t7S",
			"I0xgmYDqytpzUa6K7cl1wuh9lnZ93siEompwoOhSHTuz26kUADs="
		],
		mashu: [
			"P/AwP///y",
			"JoR/kRntvYxCFExb6b0ZS/Y4kdeRXLaVViqFJ1vCndw+oziP+QcUADs="
		],
		mejilink: [
			"NDQ0P///y",
			"JoxheZrI4VhUE9iLc5ztQc8tz9ZBpPiN4Kq2hwZbpcTS7lk1zlYAADs="
		],
		minarism: ["AD//4H+/y", "HYyPqcutAKN8DNBlU75oa/6FoOF141EG0po67vsWADs="],
		mochikoro: [
			"AAAAICAgC",
			"IYwDqXmNq9yBUT7alr1wU2Z9gPeRWFiip6RNKfs6otkdBQA7"
		],
		mochinyoro: ["MDAwKCgoC", "FoSPqct9AaOctNqLs4au+29s4kiWUwEAOw=="],
		nagare: ["N/Z/+7r/y", "H4SPEJtt7FqItFo678t3ceWF4iGWIWim6sqirbtubQEAOw=="],
		nagenawa: [
			"ACAgACeoC",
			"JYSPacHdCgKUiiaL8NFrO7eF3RiJJWml5geS2QRX8TWxDITnegEAOw=="
		],
		nanro: ["MD//+H//y", "IIQfGcet2+KLUlFnL8rs+Q+G4khOWKJtaAqYqavBlwwUADs="],
		nawabari: [
			"MD//////y",
			"IwRihsnK2xI88dnqJM68zhl9G6V5wYmmagc24vZisavWKYsVADs="
		],
		norinori: [
			"P/d1MDAwC",
			"I4QfGcet2+KLUlFn8USvJ+Z5YLgZogZdZqYCpfpeMTVXX1MAADs="
		],
		numlin: [
			"MDAwP///y",
			"JYyBaJG6Cx6UhzIbacuszaphYkhKG+SVD7eOJpZ2yXepdGuDRgEAOw=="
		],
		nuribou: [
			"KCgoICAgC",
			"JYQRGYfKug58TlYzbaJbR3w1HTiKn8mdGamGK+ql6Uu7dlnjYQEAOw=="
		],
		nurikabe: ["P+hof/R0S", "FoSPqcvtD1eY1NHa7rSaX49F4kiWTAEAOw=="],
		nurimaze: [
			"MD/wP/0/y",
			"I4Qfp4u8aYKcs0WnINBYc+dRlIVtZHeCiMh6JfO9MSitbTwbBQA7"
		],
		paintarea: [
			"P//wMD/wC",
			"JowDCYfKug58TlYzbaJbR3w1HTiKn8lBZ5oxpOp6rTurIXvL+TsXADs="
		],
		pipelink: [
			"ID/gM//gy",
			"Kkxgqae4bYCcjs6YaoaY9a99BxWRz4mmi1VeW+d44Px6cWXhrHzG/OMoAAA7"
		],
		pipelinkr: [
			"ID//8D//y",
			"Kkxgqae4bYCcjs6YaoaY9a99BxWRz4mmi1VeW+d44Px6cWXhrHzG/OMoAAA7"
		],
		rectslider: [
			"MDAwODg4C",
			"IIxvoKuIzNyBa1Jqb5RB8359mseRkumMG6gCGSSGpSwVADs="
		],
		reflect: ["MDAwP///y", "HoyPqcvtCMAzMb5aWw5YbfpxVtKJEoONWrhO7gsnBQA7"],
		renban: [
			"ID/gP//wC",
			"JoRjeZrI4FhUM9h7F4yzPfh1mkRp2MmF6iOCLIVaZvrWpF16bnwVADs="
		],
		ringring: [
			"KCgoMDAwC",
			"JwRiqae4bYKctDr3Isw63dp1VsgcYCmeWDmirLpx6/p81n1xJL04BQA7"
		],
		ripple: ["AD//////y", "IIyBYJG6jRg8sNqLs97RyvZMnxNGo3liKce2XkuBVVAAADs="],
		roma: ["P/wwf///y", "IoSPqXvBGtxrcZpYJ85sc+hJYLiE2Ggm5oas7OWeQMzSWwEAOw=="],
		sashigane: ["IH/gf///y", "HYyPqcsBrcBrskp4LjZz+79p2NQxZRkhaOp4IhgUADs="],
		shakashaka: [
			"AAAAICAgC",
			"IoSPqRe7AR2CVAKKHd5q++l9VxgaJMecTXJqoltZ4ypfSwEAOw=="
		],
		shikaku: ["ICAgMDAwC", "HoSPGcm43YKctMoIcVab9/N8QPiRjoVe4riyq7kFBQA7"],
		shimaguni: ["P//wMD/wC", "G4yPqavgDx2KFMwKL5as+w+GBqVtJXZWqcgeBQA7"],
		shugaku: [
			"AAAQAAAgC",
			"JoRvoauIzNyBSyYaXp37Nv55GTiKGnWWQESmbguLrISp6ezUFlAAADs="
		],
		shwolf: ["ID/gMD/wC", "IQyOiQas6RqcytlXsY569RaE4vhx5Zedx5WulKuamNwFBQA7"],
		slalom: ["ID//////y", "IIwPecsJDIOLcNJlr3FP76yBF+d9SkmipydSbbWOsVEAADs="],
		slither: ["AAAAP///y", "F4yPqcutAF5MULqLs978Vjohnxh2ZlYAADs="],
		sudoku: ["P//wP///y", "HoRvgcvKDxxccp5qY0bY9hiE4khCn7ldabJq6/l8BQA7"],
		sukoro: [
			"MDAwODg4C",
			"JYyPoMin39KDMUwa76p2crd9HGaQF0hpQHeqrOe671p6KEOKSAEAOw=="
		],
		tapa: ["P+hof/R0S", "IISPqRAdm9yDR9LqrjY2ZvYhXSd+JNZs2gmxi6vAqlEAADs="],
		tasquare: ["ICAgGBgYC", "IYxvoKuIzNyBSyYKbMDZcv15HPaMzWR2l1mmFcrCYzsfBQA7"],
		tatamibari: ["LP/gf///y", "HYSPqaHA2x6SM9pETzbbwY9dFTiG5lmmzcq2rlIAADs="],
		tateyoko: ["P/AwP///y", "H4RjqQvI3+BzJ9hLqUx6R8+BXreRkoZhofiJJvROSgEAOw=="],
		tawa: ["MDAwODg4C", "GIR/gcud3hRccj57Mai6+8lZIeiNkOlwBQA7"],
		tentaisho: [
			"IWL/X23/y",
			"KASCYcum+5qDUx6mYtPZ3u19VZhooVWeBzJK5WNCr7jNsfOyXq6mQAEAOw=="
		],
		tilepaint: [
			"KCgoICAgC",
			"JowDCYfKug58TlYzbaJbR3w1HTiKn8lBZ5oxpOp6rTurIXvL+TsXADs="
		],
		toichika: [
			"ID/gP///y",
			"IoSPqRvsGlqSJlp6adXAwreE4nhwooeYWWlW6ZpObfeRYQEAOw=="
		],
		triplace: [
			"MD/wP///y",
			"JgyOCXas6dxrKNiLb51xv0593lJhI6ig0jlCZQabEzuHZH0v8V4AADs="
		],
		usotatami: [
			"MD/wP//wC",
			"KIQTppqcvc6BMKIKsIuZN10hjDdZnkguKNeV2ri+pQquKi2l9nulQAEAOw=="
		],
		wagiri: ["P/rw////y", "IIQPEci42dgzs1Ua77na7ShBoNR1YpilKmqtrOd+MVUAADs="],
		yajikazu: ["P/B/f///y", "HoSPEMm5DZ8JtNoKmcyTo+1loBh25YVSX3mMnMsyBQA7"],
		yajilin: ["MD/wP///y", "HISDicas2tpL0c1Qs968nwuGl0eWHqihmVqxRgEAOw=="],
		yajitatami: [
			"MD/wP//wC",
			"J4wPeRvpj9SbwLhG4WV8aZkpWBVWFkh1HHSSZTuGY7ypXYnSE/y2BQA7"
		],
		yosenabe: [
			"ODg/////y",
			"JIwDd6nGjdqD0VFZr5qg+4ltGgiKJkWO4bJ8nVhCT8yeq20dBQA7"
		],

		/* カラーパレットが3-4色時のHeader(途中まで), 16×16サイズのData Block(途中から) */
		bosanowa: [
			"P/AwP/hw////////y",
			"LowtAst5l1gTL6Q4r968e5VR0CUBToVJ55NOlQWqIhsvGv3l+j22/FgyzYAlRwEAOw=="
		],
		dosufuwa: [
			"JmZmbKysszMzP///y",
			"KUyAYMuW3lhCMJ6plMXZXu59TyiSpIAKZmqoXoq2L6y6EV3PeLifbFAAADs="
		],
		sukororoom: [
			"NDQ0ODg4PDw8P///y",
			"NIwfgqebBqJpS8X7nL0g18B1FNJgHukkwsqu6ZiioISYmzljN51LewfhZHBBICw2aSmXggIAOw=="
		],
		view: [
			"MD/wP//wP///////y",
			"LoQtEst5l1gTDykZXNq8+99hThWJFHlJ41OqJ5tOFdDKaAbmOnebc71YQWJBSgEAOw=="
		],
		wblink: [
			"NDQ0ODg4Pj4+P///y",
			"LoQdIct5l1gLDykpXNq8+99hThWJFHlJ41OqJ5tOFdDKaAbmOnebc71YQWJBSgEAOw=="
		]
	}[pid];

	/* 無い場合はimage.gifを返します */
	if (!data) {
		data = [
			"MD/wPD/8C",
			"KYQTpogKnFxbMDpa7W18yjhp1yGO1OidW5mSKFuaTyy585t0ctZ+EFAAADs="
		];
	}

	if (data[0].length <= 10) {
		header = "R0lGODdhEAAQAIAAA";
	} else {
		header = "R0lGODdhEAAQAKEAA";
	}

	return (
		"data:image/gif;base64," + header + data[0] + "wAAAAAEAAQAAAC" + data[1]
	);
}

// MenuArea.js v3.4.0
/* global getEL:readonly, _doc:readonly */

// メニュー描画/取得/html表示系
ui.menuarea = {
	captions: [], // 言語指定を切り替えた際のキャプションを保持する
	menuitem: null, // メニューの設定切り替え用エレメント等を保持する
	nohover: false, // :hover擬似クラスを使用しないでhover表示する

	//---------------------------------------------------------------------------
	// menuarea.reset()  メニュー、サブメニュー、フロートメニューの初期設定を行う
	//---------------------------------------------------------------------------
	reset: function() {
		this.createMenu();

		this.display();
	},

	//---------------------------------------------------------------------------
	// menuarea.createMenu()  メニューの初期設定を行う
	//---------------------------------------------------------------------------
	createMenu: function() {
		if (this.menuitem === null) {
			this.modifySelector();

			this.menuitem = {};
			this.walkElement(getEL("menupanel"));
		}
		ui.misc.displayByPid(getEL("menupanel"));
		this.stopHovering();
	},

	//---------------------------------------------------------------------------
	// menuarea.walkElement()  エレメントを探索して領域の初期設定を行う
	//---------------------------------------------------------------------------
	walkElement: function(parent) {
		var menuarea = this;
		function menufactory(role) {
			return function(e) {
				menuarea[role](e);
				if (menuarea.nohover) {
					e.preventDefault();
					e.stopPropagation();
				}
			};
		}
		function addmenuevent(el, type, role) {
			var func = typeof role === "function" ? role : menufactory(role);
			pzpr.util.addEvent(el, type, menuarea, func);
		}
		ui.misc.walker(parent, function(el) {
			if (el.nodeType === 1 && el.nodeName === "LI") {
				var setevent = false;
				var idname = ui.customAttr(el, "config");
				if (!!idname) {
					menuarea.menuitem[idname] = { el: el };
					if (el.className === "check") {
						addmenuevent(el, "mousedown", "checkclick");
						setevent = true;
					}
				}
				var value = ui.customAttr(el, "value");
				if (!!value) {
					var parent = el.parentNode.parentNode;
					idname = ui.customAttr(parent, "config");
					var item = menuarea.menuitem[idname];
					if (!item.children) {
						item.children = [];
					}
					item.children.push(el);

					addmenuevent(el, "mousedown", "childclick");
					setevent = true;
				}

				var role = ui.customAttr(el, "menuExec");
				if (!!role) {
					addmenuevent(el, "mousedown", role);
					setevent = true;
				}
				role = ui.customAttr(el, "pressExec");
				if (!!role) {
					var roles = role.split(/,/);
					addmenuevent(el, "mousedown", roles[0]);
					if (!!role[1]) {
						addmenuevent(el, "mouseup", roles[1]);
						addmenuevent(el, "mouseleave", roles[1]);
						addmenuevent(el, "touchcancel", roles[1]);
					}
					setevent = true;
				}
				role = ui.customAttr(el, "popup");
				if (!!role) {
					addmenuevent(el, "mousedown", "disppopup");
					setevent = true;
				}

				if (el.className === "link") {
					addmenuevent(el, "mousedown", "updatelink");
					setevent = true; // bypass setting event below
				}

				if (!setevent) {
					if (!menuarea.nohover || !el.querySelector("menu")) {
						addmenuevent(el, "mousedown", function(e) {
							e.preventDefault();
						});
					} else {
						addmenuevent(el, "mousedown", function(e) {
							menuarea.showHovering(e, el);
							e.preventDefault();
							e.stopPropagation();
						});
					}
				}

				var link = ui.customAttr(el, "pidlink");
				if (!!link) {
					el.firstChild.setAttribute("href", link + ui.puzzle.pid);
				}
			} else if (el.nodeType === 1 && el.nodeName === "MENU") {
				var label = el.getAttribute("label");
				if (!!label && label.match(/^__(.+)__$/)) {
					menuarea.captions.push({
						menu: el,
						str_key: RegExp.$1
					});
					if (menuarea.nohover) {
						addmenuevent(el, "mousedown", function(e) {
							e.stopPropagation();
						});
					}
				}
			} else if (el.nodeType === 3) {
				if (el.data.match(/^__(.+)__$/)) {
					menuarea.captions.push({
						textnode: el,
						str_key: RegExp.$1
					});
				}
			}
		});
	},

	//--------------------------------------------------------------------------------
	// menuarea.modifySelector()  MenuAreaに関するCSSセレクタテキストを変更する (Android向け)
	//--------------------------------------------------------------------------------
	modifySelector: function() {
		/* Android 4.0, iOS5.1以上向け処理です */
		if (!pzpr.env.OS.mobile || !getEL("menupanel").classList) {
			return;
		}
		var sheet = _doc.styleSheets[0];
		var rules = sheet.cssRules || sheet.rules;
		if (rules === null) {
		} // Chromeでローカルファイルを開くとおかしくなるので、とりあえず何もしないようにします

		for (var i = 0, len = rules.length; i < len; i++) {
			var rule = rules[i];
			if (!rule.selectorText) {
				continue;
			}
			if (rule.selectorText.match(/\#menupanel.+\:hover.*/)) {
				sheet.insertRule(rule.cssText.replace(":hover", ".hovering"), i);
				sheet.deleteRule(i + 1);
			}
		}
		this.nohover = true;
	},

	//--------------------------------------------------------------------------------
	// menuarea.showHovering()  MenuAreaのポップアップを表示する (Android向け)
	// menuarea.stopHovering()  MenuAreaのポップアップを消去する (Android向け)
	//--------------------------------------------------------------------------------
	showHovering: function(e, el0) {
		if (!this.nohover) {
			return;
		}
		el0.classList.toggle("hovering");
		ui.misc.walker(getEL("menupanel"), function(el) {
			if (el.nodeType === 1 && !!el.classList && !el.contains(el0)) {
				el.classList.remove("hovering");
			}
		});
	},
	stopHovering: function() {
		if (!this.nohover) {
			return;
		}
		ui.misc.walker(getEL("menupanel"), function(el) {
			if (el.nodeType === 1 && !!el.classList) {
				el.classList.remove("hovering");
			}
		});
	},

	//---------------------------------------------------------------------------
	// menuarea.display()    全てのメニューに対して文字列を設定する
	// menuarea.setdisplay() サブメニューに表示する文字列を個別に設定する
	//---------------------------------------------------------------------------
	display: function() {
		getEL("menupanel").style.display = "";

		getEL("menu_imagesave").className = ui.enableSaveImage ? "" : "disabled";

		var EDITOR = !ui.puzzle.playeronly;
		getEL("menu_edit").style.display = EDITOR ? "" : "none";
		getEL("menu_newboard").style.display = EDITOR ? "" : "none";
		getEL("menu_urloutput").style.display = EDITOR ? "" : "none";
		getEL("menu_adjust").style.display = EDITOR ? "" : "none";
		getEL("menu_turnflip").style.display = EDITOR ? "" : "none";

		for (var idname in this.menuitem) {
			this.setdisplay(idname);
		}
		this.setdisplay("operation");
		this.setdisplay("trialmode");
		this.setdisplay("toolarea");

		/* キャプションの設定 */
		for (var i = 0; i < this.captions.length; i++) {
			var obj = this.captions[i];
			if (!!obj.textnode) {
				obj.textnode.data = ui.i18n(obj.str_key);
			} else if (!!obj.menu) {
				obj.menu.setAttribute("label", ui.i18n(obj.str_key));
			}
		}
	},
	setdisplay: function(idname) {
		if (idname === "trialmode") {
			var trial = ui.puzzle.board.trialstage > 0;
			getEL("menu_adjust").className = trial ? "disabled" : "";
			getEL("menu_turnflip").className = trial ? "disabled" : "";
		}

		if (idname === "toolarea") {
			var str;
			if (!ui.menuconfig.get("toolarea")) {
				str = ui.i18n("toolarea.show");
			} else {
				str = ui.i18n("toolarea.hide");
			}
			getEL("menu_toolarea").textContent = str;
		} else if (this.menuitem === null || !this.menuitem[idname]) {
			/* DO NOTHING */
		} else if (ui.menuconfig.valid(idname)) {
			var menuitem = this.menuitem[idname];
			menuitem.el.style.display = "";

			/* セレクタ部の設定を行う */
			if (!!menuitem.children) {
				var children = menuitem.children;
				var validval =
					idname === "inputmode" ? ui.puzzle.mouse.getInputModeList() : null;
				for (var i = 0; i < children.length; i++) {
					var child = children[i],
						value = ui.customAttr(child, "value"),
						selected = value === "" + ui.menuconfig.get(idname);
					child.className = selected ? "checked" : "";
					child.style.display =
						validval === null || validval.indexOf(value) >= 0 ? "" : "none";
				}
			} else if (!!menuitem.el) {
				/* Check部の表記の変更 */
				var cname = ui.menuconfig.get(idname) ? "checked" : "check";
				var disabled = null;
				if (ui.puzzle.config.getvariant(idname)) {
					disabled = !ui.puzzle.editmode;
				}
				if (disabled === true) {
					cname += " disabled";
				}

				menuitem.el.className = cname;
			}
		} else if (!!this.menuitem[idname]) {
			this.menuitem[idname].el.style.display = "none";
		}
	},

	//---------------------------------------------------------------------------
	// menuarea.checkclick()   メニューから設定値の入力があった時、設定を変更する
	// menuarea.childclick()   メニューから設定値の入力があった時、設定を変更する
	//---------------------------------------------------------------------------
	checkclick: function(e) {
		var el = e.target;
		if (el.nodeName === "SPAN") {
			el = el.parentNode;
		}
		if (el.className.match(/disabled/)) {
			return;
		}

		var idname = ui.customAttr(el, "config");
		ui.menuconfig.set(idname, !ui.menuconfig.get(idname));
	},
	childclick: function(e) {
		var el = e.target;
		if (el.nodeName === "SPAN") {
			el = el.parentNode;
		}

		var parent = el.parentNode.parentNode;
		ui.menuconfig.set(
			ui.customAttr(parent, "config"),
			ui.customAttr(el, "value")
		);
	},

	//---------------------------------------------------------------------------
	// メニューがクリックされた時の動作を呼び出す
	//---------------------------------------------------------------------------
	// submenuから呼び出される関数たち
	undo: function() {
		ui.auxeditor.close(true);
		ui.undotimer.startUndo();
	},
	undostop: function() {
		ui.undotimer.stopUndo();
	},
	undoall: function() {
		ui.auxeditor.close(true);
		ui.puzzle.undoall();
	},
	redo: function() {
		ui.auxeditor.close(true);
		ui.undotimer.startRedo();
	},
	redostop: function() {
		ui.undotimer.stopRedo();
	},
	redoall: function() {
		ui.auxeditor.close(true);
		ui.puzzle.redoall();
	},
	enterTrial: function() {
		if (ui.puzzle.board.trialstage === 0) {
			ui.puzzle.enterTrial();
		}
	},
	enterFurtherTrial: function() {
		ui.puzzle.enterTrial();
	},
	acceptTrial: function() {
		ui.auxeditor.close(true);
		ui.puzzle.acceptTrial();
	},
	rejectTrial: function() {
		ui.auxeditor.close(true);
		ui.puzzle.rejectTrial();
	},
	rejectCurrentTrial: function() {
		ui.auxeditor.close(true);
		ui.puzzle.rejectCurrentTrial();
	},
	toolarea: function() {
		ui.menuconfig.set("toolarea", !ui.menuconfig.get("toolarea"));
		ui.displayAll();
	},
	disppopup: function(e) {
		var el = e.target;
		if (el.nodeName === "SPAN") {
			el = el.parentNode;
		}
		if (el.className !== "disabled") {
			var idname = ui.customAttr(el, "popup");
			if (!pzpr.env.OS.mobile) {
				var pos = pzpr.util.getPagePos(e);
				ui.popupmgr.open(idname, pos.px - 8, pos.py - 8);
			} else {
				var rect = pzpr.util.getRect(getEL("menupanel"));
				ui.popupmgr.open(idname, 8, rect.bottom + 8);
			}
			this.stopHovering();
		}
	},
	updatelink: function(e) {
		var el = e.target;
		var linktype = ui.customAttr(el.parentNode, "linktype");
		switch (linktype) {
			case "duplicate":
				var url = ui.puzzle.getURL(
					pzpr.parser.URL_PZPRFILE,
					ui.puzzle.playeronly ? "player" : "editor"
				);
				el.setAttribute("href", url);
				break;
		}
	},

	//------------------------------------------------------------------------------
	// menuarea.answercheck()「正答判定」ボタンを押したときの処理
	// menuarea.answerclear()  「解答消去」ボタンを押したときの処理
	// menuarea.submarkclear()  「補助消去」ボタンを押したときの処理
	//------------------------------------------------------------------------------
	answercheck: function() {
		var check = ui.puzzle.check(true);
		if (check.complete) {
			ui.timer.stop();
			if (ui.callbackComplete) {
				ui.callbackComplete(ui.puzzle, check);
			}
		}
		var str = "",
			texts = check.text.split(/\n/);
		for (var i = 0; i < texts.length; i++) {
			str += '<div style="margin-bottom:6pt;">' + texts[i] + "</div>";
		}
		this.stopHovering();
		ui.notify.alert(str);
	},
	answerclear: function() {
		this.stopHovering();
		ui.notify.confirm(ui.i18n("ansclear.confirm"), function() {
			ui.puzzle.ansclear();
		});
	},
	submarkclear: function() {
		this.stopHovering();
		ui.notify.confirm(ui.i18n("subclear.confirm"), function() {
			ui.puzzle.subclear();
		});
	}
};

// Menu.js v3.4.0
/* global _doc:readonly, getEL:readonly */

//---------------------------------------------------------------------------
// ★PopupManagerクラス ポップアップメニューを管理します
//---------------------------------------------------------------------------
ui.popupmgr = {
	popup: null /* 表示中のポップアップメニュー */,

	popups: {} /* 管理しているポップアップメニューのオブジェクト一覧 */,

	movingpop: null /* 移動中のポップアップメニュー */,
	offset: {
		px: 0,
		py: 0
	} /* 移動中ポップアップメニューのページ左上からの位置 */,

	//---------------------------------------------------------------------------
	// popupmgr.reset()      ポップアップメニューの設定をクリアする
	// popupmgr.setEvents()  ポップアップメニュー(タイトルバー)のイベントを設定する
	//---------------------------------------------------------------------------
	reset: function() {
		/* イベントを割り当てる */
		this.setEvents();

		/* Captionを設定する */
		this.translate();
	},

	setEvents: function() {
		ui.event.addEvent(_doc, "mousemove", this, this.titlebarmove);
		ui.event.addEvent(_doc, "touchmove", this, this.titlebarmove);
		ui.event.addEvent(_doc, "mouseup", this, this.titlebarup);
		ui.event.addEvent(_doc, "touchend", this, this.titlebarup);
	},

	//---------------------------------------------------------------------------
	// popupmgr.translate()  言語切り替え時にキャプションを変更する
	//---------------------------------------------------------------------------
	translate: function() {
		for (var name in this.popups) {
			this.popups[name].translate();
		}
	},

	//---------------------------------------------------------------------------
	// popupmgr.addpopup()   ポップアップメニューを追加する
	//---------------------------------------------------------------------------
	addpopup: function(idname, proto) {
		var NewPopup = {},
			template = this.popups.template || {};
		for (var name in template) {
			NewPopup[name] = template[name];
		}
		for (name in proto) {
			NewPopup[name] = proto[name];
		}
		this.popups[idname] = NewPopup;
	},

	//---------------------------------------------------------------------------
	// popupmgr.open()  ポップアップメニューを開く
	//---------------------------------------------------------------------------
	open: function(idname, px, py) {
		var target = this.popups[idname] || null;
		if (target !== null) {
			/* 表示しているウィンドウがある場合は閉じる */
			if (!target.multipopup && !!this.popup) {
				this.popup.close();
			}

			/* ポップアップメニューを表示する */
			target.show(px, py);
			return true;
		}
		return false;
	},

	//---------------------------------------------------------------------------
	// popupmgr.titlebardown()  タイトルバーをクリックしたときの動作を行う(タイトルバーにbind)
	// popupmgr.titlebarup()    タイトルバーでボタンを離したときの動作を行う(documentにbind)
	// popupmgr.titlebarmove()  タイトルバーからマウスを動かしたときポップアップメニューを動かす(documentにbind)
	//---------------------------------------------------------------------------
	titlebardown: function(e) {
		var popel = e.target.parentNode;
		var pos = pzpr.util.getPagePos(e);
		this.movingpop = popel;
		this.offset.px = pos.px - parseInt(popel.style.left, 10);
		this.offset.py = pos.py - parseInt(popel.style.top, 10);
		ui.event.enableMouse = false;
		e.preventDefault();
		e.stopPropagation();
	},
	titlebarup: function(e) {
		var popel = this.movingpop;
		if (!!popel) {
			this.movingpop = null;
			ui.event.enableMouse = true;
		}
	},
	titlebarmove: function(e) {
		var popel = this.movingpop;
		if (!!popel) {
			var pos = pzpr.util.getPagePos(e);
			popel.style.left = pos.px - this.offset.px + "px";
			popel.style.top = pos.py - this.offset.py + "px";
			e.preventDefault();
		}
	}
};

//---------------------------------------------------------------------------
// ★PopupMenuクラス ポップアップメニューを作成表示するベースのオブジェクトです
//---------------------------------------------------------------------------
ui.popupmgr.addpopup("template", {
	formname: "",
	multipopup: false,
	pid: "",

	init: function() {
		// 初回1回のみ呼び出される
		this.form = document[this.formname];
		this.pop = this.form.parentNode;
		this.titlebar = this.pop.querySelector(".titlebar") || null;
		if (!!this.titlebar) {
			pzpr.util.unselectable(this.titlebar);
			pzpr.util.addEvent(
				this.titlebar,
				"mousedown",
				ui.popupmgr,
				ui.popupmgr.titlebardown
			);
		}
		pzpr.util.addEvent(this.form, "submit", this, function(e) {
			e.preventDefault();
		});

		this.walkCaption(this.pop);
		this.translate();

		this.walkEvent(this.pop);
	},
	reset: function() {
		// パズルの種類が変わったら呼び出される
	},

	translate: function() {
		if (!this.captions) {
			return;
		}
		for (var i = 0; i < this.captions.length; i++) {
			var obj = this.captions[i];
			var text = ui.i18n(obj.str_key);
			if (!!obj.textnode) {
				obj.textnode.data = text;
			} else if (!!obj.button) {
				obj.button.value = text;
			}
		}
	},

	walkCaption: function(parent) {
		var popup = this;
		this.captions = [];
		ui.misc.walker(parent, function(el) {
			if (el.nodeType === 3 && el.data.match(/^__(.+)__$/)) {
				popup.captions.push({
					textnode: el,
					str_key: RegExp.$1
				});
			}
		});
	},
	walkEvent: function(parent) {
		var popup = this;
		function eventfactory(role) {
			return function(e) {
				popup[role](e);
				if (e.type !== "click") {
					e.preventDefault();
					e.stopPropagation();
				}
			};
		}
		ui.misc.walker(parent, function(el) {
			if (el.nodeType !== 1) {
				return;
			}
			var role = ui.customAttr(el, "buttonExec");
			if (!!role) {
				pzpr.util.addEvent(
					el,
					!pzpr.env.API.touchevent ? "click" : "mousedown",
					popup,
					eventfactory(role)
				);
			}
			role = ui.customAttr(el, "changeExec");
			if (!!role) {
				pzpr.util.addEvent(el, "change", popup, eventfactory(role));
			}
		});
	},

	show: function(px, py) {
		// 表示するたびに呼び出される
		if (!this.pop) {
			this.init();
		}
		if (this.pid !== ui.puzzle.pid) {
			this.pid = ui.puzzle.pid;
			this.reset();
		}

		this.pop.style.left = px + "px";
		this.pop.style.top = py + "px";
		this.pop.style.display = "inline";
		if (!this.multipopup) {
			ui.popupmgr.popup = this;
		}
	},
	close: function() {
		if (this.pop) {
			this.pop.style.display = "none";
		}
		if (!this.multipopup) {
			ui.popupmgr.popup = null;
		}

		ui.puzzle.key.enableKey = true;
		ui.puzzle.mouse.enableMouse = true;
	}
});

//---------------------------------------------------------------------------
// ★Popup_NewBoardクラス 新規盤面作成のポップアップメニューを作成したり表示します
//---------------------------------------------------------------------------
ui.popupmgr.addpopup("newboard", {
	formname: "newboard",

	translate: function() {
		ui.popupmgr.popups.template.translate.call(this);
		if (ui.puzzle.klass.Bank.prototype.enabled) {
			this.loadpresets();
		}
	},

	reset: function() {
		ui.misc.displayByPid(this.pop);

		if (ui.puzzle.klass.Bank.prototype.enabled) {
			getEL("nb_piecebank").style.display = "";
			this.loadpresets();
		} else {
			getEL("nb_piecebank").style.display = "none";
		}

		if (this.pid !== "tawa") {
			return;
		}
		for (var i = 0; i <= 3; i++) {
			var _div = getEL("nb_shape_" + i),
				_img = _div.children[0];
			_img.src =
				"data:image/gif;base64,R0lGODdhgAAgAKEBAAAAAP//AP//////ACwAAAAAgAAgAAAC/pSPqcvtD6OctNqLs968+98A4kiWJvmcquisrtm+MpAAwY0Hdn7vPN1aAGstXs+oQw6FyqZxKfDlpDhqLyXMhpw/ZfHJndbCVW9QATWkEdYk+Pntvn/j+dQc0hK39jKcLxcoxkZ29JeHpsfUZ0gHeMeoUyfo54i4h7lI2TjI0PaJp1boZumpeLCGOvoZB7kpyTbzIiTrglY7o4Yrc8l2irYamjiciar2G4VM7Lus6fpcdVZ8PLxmrTyd3AwcydprvK19HZ6aPf5YCX31TW3ezuwOcQ7vGXyIPA+e/w6ORZ5ir9S/gfu0ZRt4UFU3YfHiFSyoaxeMWxJLUKx4IiLGZIn96HX8iNBjQ5EG8Zkk+dDfyJAgS7Lkxy9lOJTYXMK0ibOlTJ0n2eEs97OnUJ40X668SfRo0ZU7SS51erOp0XxSkSaFGtTo1a0bUcSo9bVr2I0gypo9izat2rVs27p9Czfu2QIAOw==";
			_img.style.clip =
				"rect(0px," + (i + 1) * 32 + "px," + 32 + "px," + i * 32 + "px)";
		}
	},
	show: function(px, py) {
		ui.popupmgr.popups.template.show.call(this, px, py);
		ui.puzzle.key.enableKey = false;

		switch (ui.puzzle.pid) {
			case "sudoku":
				this.setsize_sudoku();
				break;
			case "tawa":
				this.setsize_tawa();
				break;
			default:
				this.setsize();
				break;
		}
	},

	//---------------------------------------------------------------------------
	// setsize()   盤面のサイズをセットする
	// getsize()   盤面のサイズを取得する
	//---------------------------------------------------------------------------
	setsize: function() {
		var bd = ui.puzzle.board;
		this.form.col.value = "" + bd.cols;
		this.form.row.value = "" + bd.rows;
	},
	getsize: function() {
		var col = this.form.col.value | 0;
		var row = this.form.row.value | 0;
		return !!col && !!row ? { col: col, row: row } : null;
	},

	//---------------------------------------------------------------------------
	// setsize_sudoku()   盤面のサイズをセットする (数独向け)
	// getsize_sudoku()   盤面のサイズを取得する (数独向け)
	//---------------------------------------------------------------------------
	setsize_sudoku: function() {
		for (var i = 0; i < 4; i++) {
			getEL("nb_size_sudoku_" + i).checked = "";
		}
		switch (ui.puzzle.board.cols) {
			case 16:
				getEL("nb_size_sudoku_2").checked = true;
				break;
			case 25:
				getEL("nb_size_sudoku_3").checked = true;
				break;
			case 4:
				getEL("nb_size_sudoku_0").checked = true;
				break;
			case 6:
				getEL("nb_size_sudoku_4").checked = true;
				break;
			default:
				getEL("nb_size_sudoku_1").checked = true;
				break;
		}
	},
	getsize_sudoku: function() {
		var col, row;
		if (getEL("nb_size_sudoku_2").checked) {
			col = row = 16;
		} else if (getEL("nb_size_sudoku_3").checked) {
			col = row = 25;
		} else if (getEL("nb_size_sudoku_0").checked) {
			col = row = 4;
		} else if (getEL("nb_size_sudoku_4").checked) {
			col = row = 6;
		} else {
			col = row = 9;
		}
		return { col: col, row: row };
	},

	//---------------------------------------------------------------------------
	// setsize_tawa()   盤面のサイズをセットする (たわむれんが向け)
	// getsize_tawa()   盤面のサイズを取得する (たわむれんが向け)
	//---------------------------------------------------------------------------
	setsize_tawa: function() {
		/* タテヨコのサイズ指定部分 */
		var bd = ui.puzzle.board,
			col = bd.cols,
			row = bd.rows,
			shape = bd.shape;

		if (shape === 3) {
			col++;
		}
		this.form.col.value = "" + col;
		this.form.row.value = "" + row;

		/* たわむレンガの形状指定ルーチン */
		this.setshape(shape);
	},
	getsize_tawa: function() {
		var col = this.form.col.value | 0;
		var row = this.form.row.value | 0;
		if (!col || !row) {
			return null;
		}

		var shape = this.getshape();
		if (!isNaN(shape) && !(col === 1 && (shape === 0 || shape === 3))) {
			if (shape === 3) {
				col--;
			}
		} else {
			return null;
		}

		return { col: col, row: row, shape: shape };
	},

	//---------------------------------------------------------------------------
	// setshape()   たわむれんの形状から形状指定ボタンの初期値をセットする
	// getshape()   たわむれんがのどの形状が指定されか取得する
	// clickshape() たわむれんがの形状指定ボタンを押した時の処理を行う
	// setshapeidx() たわむれんがの形状指定ボタンに背景色を設定する
	// getshapeidx() たわむれんがの形状指定ボタン背景色からインデックスを取得する
	// loadpresets() Fill the dropdown with all possible Bank presets.
	//---------------------------------------------------------------------------
	setshape: function(shape) {
		this.setshapeidx([0, 2, 3, 1][shape]);
	},
	getshape: function() {
		var idx = this.getshapeidx();
		return idx !== null ? [0, 3, 1, 2][idx] : null;
	},
	clickshape: function(e) {
		this.setshapeidx(+e.target.parentNode.id.charAt(9));
	},

	setshapeidx: function(idx) {
		for (var i = 0; i <= 3; i++) {
			getEL("nb_shape_" + i).style.backgroundColor = i === idx ? "red" : "";
		}
	},
	getshapeidx: function() {
		for (var i = 0; i <= 3; i++) {
			if (getEL("nb_shape_" + i).style.backgroundColor === "red") {
				return i;
			}
		}
		return null;
	},
	loadpresets: function() {
		var root = getEL("nb_piecebank_preset");
		root.replaceChildren();

		var presets = ui.puzzle.board.bank.presets;
		for (var i = 0; i < presets.length; i++) {
			if (!presets[i].constant) {
				continue;
			}
			var option = document.createElement("option");
			option.value = presets[i].shortkey;
			option.textContent = ui.i18n(presets[i].name) || presets[i].name;
			root.appendChild(option);
		}
	},

	//---------------------------------------------------------------------------
	// execute() 新規盤面を作成するボタンを押したときの処理を行う
	//---------------------------------------------------------------------------
	execute: function() {
		var pid = ui.puzzle.pid;
		var obj;
		switch (pid) {
			case "sudoku":
				obj = this.getsize_sudoku();
				break;
			case "tawa":
				obj = this.getsize_tawa();
				break;
			default:
				obj = this.getsize();
				break;
		}

		this.close();
		if (!!obj) {
			var url = pid + "/" + obj.col + "/" + obj.row;
			if (pid === "tawa") {
				url += "/" + obj.shape;
			}
			if (ui.puzzle.klass.Bank.prototype.enabled) {
				url += "///" + this.form.preset.value;
			}
			ui.puzzle.open(url);
		}
	}
});

//---------------------------------------------------------------------------
// ★Popup_URLInputクラス URL入力のポップアップメニューを作成したり表示します
//---------------------------------------------------------------------------
ui.popupmgr.addpopup("urlinput", {
	formname: "urlinput",

	//------------------------------------------------------------------------------
	// urlinput() URLを入力する
	//------------------------------------------------------------------------------
	urlinput: function() {
		this.close();
		ui.puzzle.open(this.form.ta.value.replace(/\n/g, ""));
	}
});

//---------------------------------------------------------------------------
// ★Popup_URLOutputクラス URL出力のポップアップメニューを作成したり表示します
//---------------------------------------------------------------------------
ui.popupmgr.addpopup("urloutput", {
	formname: "urloutput",

	init: function() {
		ui.popupmgr.popups.template.init.call(this);
		this.urlanchor = getEL("urlanchor");
	},

	reset: function(px, py) {
		var form = this.form,
			pid = ui.puzzle.pid,
			exists = pzpr.variety(pid).exists,
			parser = pzpr.parser;
		var url = ui.puzzle.getURL(parser.URL_PZPRV3);
		this.urlanchor.href = this.urlanchor.textContent = url;
		form.kanpen.style.display = form.kanpen.nextSibling.style.display = exists.kanpen
			? ""
			: "none";
		form.heyaapp.style.display = form.heyaapp.nextSibling.style.display =
			pid === "heyawake" ? "" : "none";
	},

	show: function(px, py) {
		ui.popupmgr.popups.template.show.call(this, px, py);
		this.reset(px, py);
	},

	//------------------------------------------------------------------------------
	// urloutput() URLを出力する
	// openurl()   「このURLを開く」を実行する
	//------------------------------------------------------------------------------
	urloutput: function(e) {
		var url = "",
			parser = pzpr.parser;
		switch (e.target.name) {
			case "kanpen":
				url = ui.puzzle.getURL(parser.URL_KANPEN);
				break;
			case "pzprv3e":
				url = ui.puzzle
					.getURL(parser.URL_PZPRV3)
					.replace(/\?(\w+)/, "?$1_edit");
				break;
			case "heyaapp":
				url = ui.puzzle.getURL(parser.URL_HEYAAPP);
				break;
		}
		this.urlanchor.href = this.urlanchor.textContent = url;
	}
});

//---------------------------------------------------------------------------
// ★Popup_FileOpenクラス ファイル入力のポップアップメニューを作成したり表示します
//---------------------------------------------------------------------------
ui.popupmgr.addpopup("fileopen", {
	formname: "fileform",

	init: function() {
		ui.popupmgr.popups.template.init.call(this);
	},

	//------------------------------------------------------------------------------
	// fileopen()  ファイルを開く
	//------------------------------------------------------------------------------
	fileopen: function(e) {
		var fileEL = this.form.filebox;
		if (!!ui.reader || ui.enableGetText) {
			var fitem = fileEL.files[0];
			if (!fitem) {
				return;
			}

			if (!!ui.reader) {
				ui.reader.readAsText(fitem);
			} else {
				ui.puzzle.open(fitem.getAsText(""));
			}
		}
		this.form.reset();
		this.close();
	}
});

//---------------------------------------------------------------------------
// ★Popup_FileSaveクラス ファイル出力のポップアップメニューを作成したり表示します
//---------------------------------------------------------------------------
ui.popupmgr.addpopup("filesave", {
	formname: "filesave",
	anchor: null,
	init: function() {
		ui.popupmgr.popups.template.init.call(this);

		this.anchor =
			!ui.enableSaveBlob && pzpr.env.API.anchor_download
				? getEL("saveanchor")
				: null;
	},
	reset: function() {
		/* ファイル形式選択オプション */
		var ispencilbox = pzpr.variety(ui.puzzle.pid).exists.pencilbox;
		this.form.filetype.options[1].disabled = !ispencilbox;
		this.form.filetype.options[2].disabled = !ispencilbox;
		var parser = pzpr.parser;
		this.form.ta.value = ui.puzzle.getFileData(parser.FILE_PZPR, {});
		this.form.ta2.value = this.form.ta.value.replace(/\n/g, "/");
	},
	/* オーバーライド */
	show: function(px, py) {
		ui.popupmgr.popups.template.show.call(this, px, py);
		this.reset();

		this.form.filename.value = ui.puzzle.pid + ".txt";
		this.changefilename();

		ui.puzzle.key.enableKey = false;
	},
	close: function() {
		if (!!this.filesaveurl) {
			URL.revokeObjectURL(this.filesaveurl);
		}

		ui.popupmgr.popups.template.close.call(this);
	},
	changefilename: function() {
		var filetype = this.form.filetype.value;
		var filename = this.form.filename.value
			.replace(".xml", "")
			.replace(".txt", "");
		var ext = filetype !== "filesave4" ? ".txt" : ".xml";
		var pinfo = pzpr.variety(filename);
		if (pinfo.pid === ui.puzzle.pid) {
			if (filetype === "filesave" || filetype === "filesave3") {
				filename = pinfo.urlid;
			} else {
				filename = pinfo.kanpenid;
			}
		}
		this.form.filename.value = filename + ext;
	},

	//------------------------------------------------------------------------------
	// filesave()  ファイルを保存する
	//------------------------------------------------------------------------------
	filesaveurl: null,
	filesave: function() {
		var form = this.form;
		var filename = form.filename.value;
		var prohibit = ["\\", "/", ":", "*", "?", '"', "<", ">", "|"];
		for (var i = 0; i < prohibit.length; i++) {
			if (filename.indexOf(prohibit[i]) !== -1) {
				ui.notify.alert(ui.i18n("filesave.invalid"));
				return;
			}
		}

		var parser = pzpr.parser,
			filetype = parser.FILE_PZPR,
			option = {};
		switch (form.filetype.value) {
			case "filesave2":
				filetype = parser.FILE_PBOX;
				break;
			case "filesave4":
				filetype = parser.FILE_PBOX_XML;
				break;
			case "filesave3":
				filetype = parser.FILE_PZPR;
				option.history = true;
				break;
		}

		var blob = null,
			filedata = null;
		if (ui.enableSaveBlob || !!this.anchor) {
			blob = new Blob([ui.puzzle.getFileData(filetype, option)], {
				type: "text/plain"
			});
		} else {
			filedata = ui.puzzle.getFileData(filetype, option);
		}

		if (ui.enableSaveBlob) {
			navigator.saveBlob(blob, filename);
			this.close();
		} else if (!!this.anchor) {
			if (!!this.filesaveurl) {
				URL.revokeObjectURL(this.filesaveurl);
			}
			this.filesaveurl = URL.createObjectURL(blob);
			this.anchor.href = this.filesaveurl;
			this.anchor.download = filename;
			this.anchor.click();
		} else {
			form.ques.value = filedata;
			form.operation.value =
				form.filetype.value !== "filesave4" ? "save" : "savexml";
			form.submit();
			this.close();
		}

		ui.puzzle.saved();
	}
});

//---------------------------------------------------------------------------
// ★Popup_ImageSaveクラス 画像出力のポップアップメニューを作成したり表示します
//---------------------------------------------------------------------------
ui.popupmgr.addpopup("imagesave", {
	formname: "imagesave",
	anchor: null,
	showsize: null,
	bankLabel: null,
	init: function() {
		ui.popupmgr.popups.template.init.call(this);

		this.anchor =
			!ui.enableSaveBlob && pzpr.env.API.anchor_download
				? getEL("saveanchor")
				: null;
		this.showsize = getEL("showsize");
		this.bankLabel = getEL("bank_label");

		/* ファイル形式選択オプション */
		var filetype = this.form.filetype,
			options = filetype.options;
		for (var i = 0; i < options.length; i++) {
			var option = options[i];
			if (!ui.enableImageType[option.value]) {
				filetype.removeChild(option);
				i--;
			}
		}
	},

	/* オーバーライド */
	show: function(px, py) {
		ui.popupmgr.popups.template.show.call(this, px, py);

		ui.puzzle.key.enableKey = false;
		ui.puzzle.mouse.enableMouse = false;

		this.form.filename.value = pzpr.variety(ui.puzzle.pid).urlid + ".png";
		this.form.cellsize.value = ui.menuconfig.get("cellsizeval");
		if (ui.puzzle.board.bank) {
			this.bankLabel.style.display = "";
			this.form.bank.checked = ui.puzzle.board.bank.shouldDrawBank();
		} else {
			this.bankLabel.style.display = "none";
		}

		this.changefilename();
		this.estimatesize();
	},
	close: function() {
		if (!!this.saveimageurl) {
			URL.revokeObjectURL(this.saveimageurl);
		}

		ui.puzzle.setCanvasSize();
		ui.popupmgr.popups.template.close.call(this);
	},

	changefilename: function() {
		var filename = this.form.filename.value.replace(/\.\w{3,4}$/, ".");
		this.form.filename.value = filename + this.form.filetype.value;
	},
	estimatesize: function() {
		var cellsize = +this.form.cellsize.value;
		var width = (+cellsize * ui.puzzle.painter.getCanvasCols()) | 0;
		var height = (+cellsize * ui.puzzle.painter.getCanvasRows()) | 0;
		this.showsize.replaceChild(
			_doc.createTextNode(width + " x " + height),
			this.showsize.firstChild
		);
	},

	//------------------------------------------------------------------------------
	// saveimage()    画像をダウンロードする
	// submitimage() "画像をダウンロード"の処理ルーチン
	// saveimage()   "画像をダウンロード"の処理ルーチン (IE10用)
	//------------------------------------------------------------------------------
	saveimageurl: null,
	saveimage: function() {
		/* ファイル名チェックルーチン */
		var form = this.form;
		var filename = form.filename.value;
		var prohibit = ["\\", "/", ":", "*", "?", '"', "<", ">", "|"];
		for (var i = 0; i < prohibit.length; i++) {
			if (filename.indexOf(prohibit[i]) !== -1) {
				ui.notify.alert(ui.i18n("filesave.invalid"));
				return;
			}
		}

		/* 画像出力ルーチン */
		var option = {
			cellsize: +this.form.cellsize.value,
			bank: this.form.bank.checked
		};
		if (this.form.transparent.checked) {
			option.bgcolor = "";
		}
		var type = form.filetype.value;

		try {
			if (ui.enableSaveBlob || !!this.anchor) {
				ui.puzzle.toBlob(
					function(blob) {
						/* 出力された画像の保存ルーチン */
						if (ui.enableSaveBlob) {
							navigator.saveBlob(blob, filename);
							this.close();
						} else {
							if (!!this.filesaveurl) {
								URL.revokeObjectURL(this.filesaveurl);
							}
							this.filesaveurl = URL.createObjectURL(blob);
							this.anchor.href = this.filesaveurl;
							this.anchor.download = filename;
							this.anchor.click();
							this.close();
						}
					}.bind(this),
					type,
					1.0,
					option
				);
			} else {
				/* 出力された画像の保存ルーチン */
				form.urlstr.value = ui.puzzle
					.toDataURL(type, 1.0, option)
					.replace(/data:.*;base64,/, "");
				form.submit();
				this.close();
			}
		} catch (e) {
			ui.notify.alert(ui.i18n("imagesave.error"));
		}
	},

	//------------------------------------------------------------------------------
	// openimage()   "別ウィンドウで開く"の処理ルーチン
	//------------------------------------------------------------------------------
	openimage: function() {
		/* 画像出力ルーチン */
		var option = {
			cellsize: +this.form.cellsize.value,
			bank: this.form.bank.checked
		};
		if (this.form.transparent.checked) {
			option.bgcolor = "";
		}
		var type = this.form.filetype.value;
		var IEkei = navigator.userAgent.match(/(Trident|Edge)\//);

		var dataurl = "";
		try {
			if (!IEkei || type !== "svg") {
				dataurl = ui.puzzle.toDataURL(type, 1.0, option);
			} else {
				dataurl = ui.puzzle.toBuffer("svg", option);
			}
		} catch (e) {
			ui.notify.alert(ui.i18n("imagesave.error"));
		}
		if (!dataurl) {
			/* No Data URL */ return;
		}

		/* 出力された画像を開くルーチン */
		function writeContent(blob) {
			var filename = this.form.filename.value;
			var cdoc = window.open("", "", "").document;
			cdoc.open();
			cdoc.writeln('<!DOCTYPE html>\n<HTML LANG="ja">\n<HEAD>');
			cdoc.writeln('<META CHARSET="utf-8">');
			cdoc.writeln("<TITLE>ぱずぷれv3</TITLE>\n</HEAD><BODY>");
			if (!!blob) {
				cdoc.writeln('<img src="', dataurl, '"><br>\n');
				cdoc.writeln(
					'<a href="',
					cdoc.defaultView.URL.createObjectURL(blob),
					'" download="',
					filename,
					'">Download ',
					filename,
					"</a>"
				);
			} else if (!IEkei || type !== "svg") {
				cdoc.writeln('<img src="', dataurl, '">');
			} else {
				cdoc.writeln(dataurl.replace(/^<\?.+?\?>/, ""));
			}
			cdoc.writeln("</BODY>\n</HTML>");
			cdoc.close();
		}
		if (pzpr.env.API.anchor_download) {
			// ChromeでDataURLが直接開けない対策
			ui.puzzle.toBlob(writeContent.bind(this), type, 1.0, option);
		} else {
			writeContent(null);
		}
	}
});

//---------------------------------------------------------------------------
// ★Popup_Adjustクラス 盤面の調整のポップアップメニューを作成したり表示します
//---------------------------------------------------------------------------
ui.popupmgr.addpopup("adjust", {
	formname: "adjust",

	adjust: function(e) {
		ui.puzzle.board.operate(e.target.name);
	}
});

//---------------------------------------------------------------------------
// ★Popup_TurnFlipクラス 回転・反転のポップアップメニューを作成したり表示します
//---------------------------------------------------------------------------
ui.popupmgr.addpopup("turnflip", {
	formname: "turnflip",

	reset: function() {
		var exec = ui.puzzle.board.exec;
		var allowed = exec.allowedOperations(false);
		this.form.turnl.disabled = !(allowed & exec.TURN);
		this.form.turnr.disabled = !(allowed & exec.TURN);
	},

	adjust: function(e) {
		ui.puzzle.board.operate(e.target.name);
	}
});

//---------------------------------------------------------------------------
// ★Popup_Metadataクラス メタデータの設定・表示を行うメニューを作成したり表示します
//---------------------------------------------------------------------------
ui.popupmgr.addpopup("metadata", {
	formname: "metadata",

	show: function(px, py) {
		ui.popupmgr.popups.template.show.call(this, px, py);

		var form = this.form;
		var puzzle = ui.puzzle,
			bd = puzzle.board,
			meta = puzzle.metadata;
		getEL("metadata_variety").innerHTML =
			pzpr.variety(puzzle.pid)[pzpr.lang] + "&nbsp;" + bd.cols + "×" + bd.rows;
		form.author.value = meta.author;
		form.source.value = meta.source;
		form.hard.value = meta.hard;
		form.comment.value = meta.comment;
	},

	save: function() {
		var form = this.form;
		var puzzle = ui.puzzle,
			meta = puzzle.metadata;
		meta.author = form.author.value;
		meta.source = form.source.value;
		meta.hard = form.hard.value;
		meta.comment = form.comment.value;
		this.close();
	}
});

//---------------------------------------------------------------------------
// ★Popup_DispSizeクラス サイズの変更を行うポップアップメニューを作成したり表示します
//---------------------------------------------------------------------------
ui.popupmgr.addpopup("dispsize", {
	formname: "dispsize",

	show: function(px, py) {
		ui.popupmgr.popups.template.show.call(this, px, py);

		this.form.cellsize.value = ui.menuconfig.get("cellsizeval");
		ui.puzzle.key.enableKey = false;
	},

	//------------------------------------------------------------------------------
	// changesize()  Canvasでのマス目の表示サイズを変更する
	//------------------------------------------------------------------------------
	changesize: function(e) {
		var csize = this.form.cellsize.value | 0;
		if (csize > 0) {
			ui.menuconfig.set("cellsizeval", csize);
		}
		this.close();
	}
});

//---------------------------------------------------------------------------
// ★Popup_About
//---------------------------------------------------------------------------
ui.popupmgr.addpopup("about", {
	formname: "about"
});

ui.popupmgr.addpopup("network", {
	formname: "network", // just to fit in with how popup template works
	urlanchor: null,
	key: "",

	init: function() {
		ui.popupmgr.popups.template.init.call(this);
		this.urlanchor = getEL("urlanchor_network");
		this.key = Math.random()
			.toString(36)
			.substr(2, 8);
	},

	coop: function(px, py) {
		var parser = pzpr.parser;
		var url = ui.puzzle.getURL(parser.URL_PZPRV3);
		url = url.replace("?", "?net=coop&key=" + this.key + "&");
		this.urlanchor.href = this.urlanchor.textContent = url;
		ui.network.configure("coop", this.key);
		ui.network.start();
	}
});

// ToolArea.js v3.4.0
/* global getEL:readonly */

// メニュー描画/取得/html表示系
// toolareaオブジェクト
ui.toolarea = {
	items: null, // ツールパネルのエレメント等を保持する
	captions: [], // 言語指定を切り替えた際のキャプションを保持する

	//---------------------------------------------------------------------------
	// toolarea.reset()  ツールパネル・ボタン領域の初期設定を行う
	//---------------------------------------------------------------------------
	reset: function() {
		if (this.items === null) {
			this.items = {};
			this.walkElement(getEL("usepanel"));
			this.walkElement(getEL("checkpanel"));
			this.walkElement(getEL("variantpanel"));
			this.walkElement(getEL("btnarea"));
		}
		ui.misc.displayByPid(getEL("checkpanel"));
		ui.misc.displayByPid(getEL("btnarea"));

		this.display();
	},

	//---------------------------------------------------------------------------
	// toolarea.walkElement()  エレメントを探索して領域の初期設定を行う
	//---------------------------------------------------------------------------
	walkElement: function(parent) {
		var toolarea = this;
		function btnfactory(role) {
			return function(e) {
				toolarea[role](e);
				if (e.type !== "click") {
					e.stopPropagation();
				}
			};
		}
		function addbtnevent(el, type, role) {
			pzpr.util.addEvent(el, type, toolarea, btnfactory(role));
		}
		ui.misc.walker(parent, function(el) {
			if (el.nodeType === 1) {
				/* ツールパネル領域 */
				var parent, idname;
				if (el.className === "config") {
					toolarea.items[ui.customAttr(el, "config")] = { el: el };
				} else if (el.className.match(/child/)) {
					(parent = el.parentNode.parentNode),
						(idname = ui.customAttr(parent, "config"));
					var item = toolarea.items[idname];
					if (!item.children) {
						item.children = [];
					}
					item.children.push(el);

					addbtnevent(el, "mousedown", "toolclick");
				} else if (el.nodeName === "INPUT" && el.type === "checkbox") {
					(parent = el.parentNode), (idname = ui.customAttr(parent, "config"));
					if (!idname) {
						(parent = parent.parentNode),
							(idname = ui.customAttr(parent, "config"));
					}
					if (!idname) {
						return;
					}
					toolarea.items[idname].checkbox = el;

					addbtnevent(el, "click", "toolclick");
				}

				/* ボタン領域 */
				var role = ui.customAttr(el, "buttonExec");
				if (!!role) {
					addbtnevent(
						el,
						!pzpr.env.API.touchevent ? "click" : "mousedown",
						role
					);
				}
				role = ui.customAttr(el, "pressExec");
				if (!!role) {
					var roles = role.split(/,/);
					addbtnevent(el, "mousedown", roles[0]);
					if (!!roles[1]) {
						addbtnevent(el, "mouseup", roles[1]);
						addbtnevent(el, "mouseleave", roles[1]);
						addbtnevent(el, "touchcancel", roles[1]);
					}
				}
			} else if (el.nodeType === 3) {
				if (el.data.match(/^__(.+)__$/)) {
					var str_key = RegExp.$1;
					toolarea.captions.push({
						textnode: el,
						str_key: str_key
					});
					parent = el.parentNode;
					if (parent.className.match(/child/)) {
						toolarea.captions.push({
							datanode: parent,
							str_key: str_key
						});
					}
				}
			}
		});
	},

	//---------------------------------------------------------------------------
	// toolarea.display()    全てのラベルに対して文字列を設定する
	// toolarea.displayVariantPanel() display the variant panel
	// toolarea.setdisplay() 管理パネルに表示する文字列を個別に設定する
	//---------------------------------------------------------------------------
	display: function() {
		/* ツールパネル領域 */
		/* -------------- */
		var mandisp = ui.menuconfig.get("toolarea") ? "block" : "none";
		getEL("usepanel").style.display = mandisp;
		getEL("checkpanel").style.display = mandisp;

		/* 経過時間の表示/非表示設定 */
		var hasTimer = ui.puzzle.playeronly && ui.menuconfig.get("timer");
		getEL("separator2").style.display =
			hasTimer && ui.menuconfig.get("toolarea") ? "" : "none";
		getEL("timerpanel").style.display = hasTimer ? "block" : "none";
		this.displayVariantPanel();

		for (var idname in this.items) {
			this.setdisplay(idname);
		}

		/* ボタン領域 */
		/* --------- */
		getEL("btnarea").style.display = "";
		pzpr.util.unselectable(getEL("btnarea"));

		this.setdisplay("operation");
		getEL("btnclear2").style.display = !ui.puzzle.board.disable_subclear
			? ""
			: "none";
		getEL("btncolor").style.display =
			ui.puzzle.pid === "tentaisho" ? "" : "none";
		getEL("btnflush").style.display =
			ui.puzzle.board.hasflush && !ui.puzzle.playeronly ? "" : "none";
		getEL("btnpresets").style.display =
			ui.puzzle.board.bank &&
			ui.puzzle.board.bank.presets.length &&
			!ui.puzzle.playeronly
				? ""
				: "none";
		/* ボタンエリアの色分けボタンは、ツールパネル領域が消えている時に表示 */
		getEL("btnirowake").style.display =
			ui.puzzle.painter.irowake && !ui.menuconfig.get("toolarea") ? "" : "none";
		getEL("btnirowakeblk").style.display =
			ui.puzzle.painter.irowakeblk && !ui.menuconfig.get("toolarea")
				? ""
				: "none";
		this.setdisplay("trialmode");
		this.setdisplay("network");

		/* 共通：キャプションの設定 */
		/* --------------------- */
		for (var i = 0; i < this.captions.length; i++) {
			var obj = this.captions[i];
			if (!!obj.textnode) {
				obj.textnode.data = ui.i18n(obj.str_key);
			}
			if (!!obj.datanode) {
				obj.datanode.setAttribute("data-text", ui.i18n(obj.str_key));
			}
		}
	},
	displayVariantPanel: function() {
		// display if the type has variants, and we're in edit mode or some
		// variants are enabled
		var shouldDisplay = (function() {
			if (!ui.menuconfig.get("toolarea")) {
				return false;
			}
			var variants = ui.puzzle.config.getVariants();
			if (Object.keys(variants).length <= 0) {
				return false;
			}
			if (!ui.puzzle.playeronly) {
				return true;
			}
			for (var key in variants) {
				if (variants[key]) {
					return true;
				}
			}
		})();
		var vardisp = shouldDisplay ? "block" : "none";
		getEL("separator1").style.display = vardisp;
		getEL("variantpanel").style.display = vardisp;
		if (ui.puzzle.playeronly) {
			getEL("variantpanel").classList.add("playeronly");
		}
	},
	setdisplay: function(idname) {
		if (idname === "variant") {
			var str;
			if (ui.menuconfig.get("variant")) {
				str = ui.i18n("check.variant");
			} else {
				str = ui.i18n("check");
			}
			getEL("btncheck").textContent = str;
		}

		var trial = ui.puzzle.board.trialstage > 0;
		var net = ui.network.mode !== "";

		if (idname === "operation") {
			var opemgr = ui.puzzle.opemgr;
			getEL("btnundo").disabled = !opemgr.enableUndo;
			getEL("btnredo").disabled = !opemgr.enableRedo;
			getEL("btntriale").disabled = opemgr.atStartOfTrial();
		} else if (idname === "trialmode") {
			getEL("btnclear").disabled = trial;
			getEL("btntrial").disabled = trial;
			getEL("btntrialarea").style.display = trial && !net ? "block" : "none";
		} else if (idname === "network") {
			getEL("btnundo").style.display = net ? "none" : "inline";
			getEL("btnredo").style.display = net ? "none" : "inline";
			getEL("btntrial").style.display = net ? "none" : "inline";
			getEL("btntrialarea").style.display = trial && !net ? "block" : "none";
		} else if (this.items === null || !this.items[idname]) {
			/* DO NOTHING */
		} else if (ui.menuconfig.valid(idname)) {
			var toolitem = this.items[idname];
			toolitem.el.style.display = "";

			if (idname === "mode") {
				this.displayVariantPanel();
			}

			var disabled = null;
			/* 子要素の設定を行う */
			if (!!toolitem.children) {
				var children = toolitem.children;
				var validval =
					idname === "inputmode"
						? ui.puzzle.mouse.getInputModeList()
						: idname === "auxeditor_inputmode"
						? ui.auxeditor.puzzle.mouse.getInputModeList()
						: null;
				for (var i = 0; i < children.length; i++) {
					var child = children[i],
						value = ui.customAttr(child, "value"),
						selected = value === "" + ui.menuconfig.get(idname);
					child.className = selected ? "child childsel" : "child";
					child.style.display =
						validval === null || validval.indexOf(value) >= 0 ? "" : "none";
				}

				if (idname === "inputmode") {
					disabled = validval.length === 1;
				}
				if (disabled !== null) {
					toolitem.el.className = !disabled ? "" : "disabled";
				}
			} else if (!!toolitem.checkbox) {
				/* チェックボックスの表記の設定 */
				var check = toolitem.checkbox;
				if (!!check) {
					check.checked = ui.menuconfig.get(idname);
				}

				if (idname === "keypopup") {
					disabled = !ui.keypopup.paneltype[ui.puzzle.editmode ? 1 : 3];
				}
				if (idname === "bgcolor") {
					disabled = ui.puzzle.editmode;
				}
				if (idname === "mouseonly") {
					disabled = ui.puzzle.editmode && ui.puzzle.pid === "magnets";
				}
				if (ui.puzzle.config.getvariant(idname)) {
					disabled = !ui.puzzle.editmode;
				}
				if (disabled !== null) {
					toolitem.checkbox.disabled = !disabled ? "" : "true";
				}
			}
		} else if (!!this.items[idname]) {
			this.items[idname].el.style.display = "none";
		}
	},

	//---------------------------------------------------------------------------
	// toolarea.toolclick()   ツールパネルの入力があった時、設定を変更する
	//---------------------------------------------------------------------------
	toolclick: function(e) {
		var el = e.target,
			parent = el.parentNode;
		var idname =
				ui.customAttr(parent, "config") ||
				ui.customAttr(parent.parentNode, "config"),
			value;
		if (!!this.items[idname].checkbox) {
			value = !!el.checked;
		} else {
			value = ui.customAttr(el, "value");
		}
		ui.menuconfig.set(idname, value);
	},

	//---------------------------------------------------------------------------
	// Canvas下にあるボタンが押された/放された時の動作
	//---------------------------------------------------------------------------
	answercheck: function() {
		ui.menuarea.answercheck();
	},
	undo: function() {
		ui.auxeditor.close(true);
		ui.undotimer.startUndo();
	},
	undostop: function() {
		ui.undotimer.stopUndo();
	},
	redo: function() {
		ui.auxeditor.close(true);
		ui.undotimer.startRedo();
	},
	redostop: function() {
		ui.undotimer.stopRedo();
	},
	ansclear: function() {
		ui.menuarea.answerclear();
	},
	subclear: function() {
		ui.menuarea.submarkclear();
	},
	irowake: function() {
		ui.puzzle.irowake();
	},
	encolorall: function() {
		ui.puzzle.board.encolorall();
	} /* 天体ショーのボタン */,
	dropblocks: function() {
		ui.puzzle.board.operate("drop");
	},
	resetblocks: function() {
		ui.puzzle.board.operate("resetpos");
	},
	outlineshaded: function() {
		ui.puzzle.board.operate("outlineshaded");
	},
	flushexcell: function() {
		ui.puzzle.board.flushexcell();
	},
	applypreset: function(e) {
		ui.auxeditor.close();

		ui.popupmgr.open("applypreset", 0, 0);
		var rect = pzpr.util.getRect(getEL("btnarea"));
		var bounds = pzpr.util.getRect(getEL("popapplypreset"));
		ui.popupmgr.open(
			"applypreset",
			rect.left + (rect.width - bounds.width) / 2,
			Math.max(16, rect.top - bounds.height - 16)
		);
	},
	enterTrial: function() {
		if (ui.puzzle.board.trialstage === 0) {
			ui.puzzle.enterTrial();
		}
	},
	enterFurtherTrial: function() {
		ui.puzzle.enterTrial();
	},
	acceptTrial: function() {
		ui.puzzle.acceptTrial();
	},
	rejectTrial: function() {
		ui.puzzle.rejectCurrentTrial();
	}
};

// Notify.js v3.5.0
/* global getEL:readonly */

//---------------------------------------------------------------------------
// ★Notifyクラス alert, confirm関連を管理します
//---------------------------------------------------------------------------
ui.notify = {
	onconfirm: null,

	//---------------------------------------------------------------------------
	// notify.reset()      Notificationの設定を初期化する
	//---------------------------------------------------------------------------
	reset: function() {
		/* イベントを割り当てる */
		this.walkElement(getEL("notifies"));
	},

	//---------------------------------------------------------------------------
	// notify.walkElement()  エレメントを探索して領域の初期設定を行う
	//---------------------------------------------------------------------------
	walkElement: function(parent) {
		var notify = this;
		ui.misc.walker(parent, function(el) {
			if (el.nodeType === 1) {
				/* ボタン領域 */
				var role = ui.customAttr(el, "buttonExec");
				if (!!role) {
					pzpr.util.addEvent(
						el,
						!pzpr.env.API.touchevent ? "click" : "mousedown",
						notify,
						notify[role]
					);
				}

				/* タイトルバーでボックスを動かす設定 */
				if (el.className === "titlebar") {
					pzpr.util.addEvent(
						el,
						"mousedown",
						ui.popupmgr,
						ui.popupmgr.titlebardown
					);
					pzpr.util.addEvent(
						el,
						"touchstart",
						ui.popupmgr,
						ui.popupmgr.titlebardown
					);
				}
			}
		});
	},

	//--------------------------------------------------------------------------------
	// ui.alert()   現在の言語に応じたダイアログを表示する
	// ui.confirm() 現在の言語に応じた選択ダイアログを表示し、結果を返す
	// ui.setVerticalPosition() 指定したエレメントの盾位置を画面中央に設定して表示する
	//--------------------------------------------------------------------------------
	alert: function(str) {
		getEL("notification").innerHTML = str;
		this.setVerticalPosition(getEL("assertbox"));
	},
	confirm: function(str, func) {
		getEL("confirmcaption").innerHTML = str;
		this.setVerticalPosition(getEL("confirmbox"));
		this.onconfirm = func;
	},
	setVerticalPosition: function(el) {
		var elbg = getEL("notifybg");
		elbg.style.display = "block";
		el.style.display = "inline-block";

		/* innerHeightがIE8以下にないので、代わりに背景要素の高さ(height=100%), 幅を取得します */
		var rect = pzpr.util.getRect(el),
			rectbg = pzpr.util.getRect(elbg);
		el.style.top = (rectbg.height - rect.height) / 2 + "px";
		el.style.left = (rectbg.width - rect.width) / 2 + "px";
	},

	//---------------------------------------------------------------------------
	// notify.closealert()  alertを非表示に戻す
	//---------------------------------------------------------------------------
	closealert: function(e) {
		getEL("assertbox").style.display = "none";
		getEL("notifybg").style.display = "none";
		e.preventDefault();
		e.stopPropagation();
	},

	//---------------------------------------------------------------------------
	// notify.confirmtrue()  confirmでOKが押された時の処理を記入する
	// notify.confirmfalse() confirmでCancelが押されたときの処理を記入する
	//---------------------------------------------------------------------------
	confirmtrue: function(e) {
		if (!!this.onconfirm) {
			this.onconfirm();
		}
		this.onconfirm = null;
		this.confirmfalse(e);
	},
	confirmfalse: function(e) {
		getEL("confirmbox").style.display = "none";
		getEL("notifybg").style.display = "none";
		e.preventDefault();
		e.stopPropagation();
	}
};

// KeyPopup.js v3.4.0
/* global createEL:readonly, getEL:readonly */

//---------------------------------------------------------------------------
// ★KeyPopupクラス マウスからキーボード入力する際のPopupウィンドウを管理する
//---------------------------------------------------------------------------
// キー入力用Popupウィンドウ
ui.keypopup = {
	/* メンバ変数 */
	paneltype: { 1: 0, 3: 0 } /* パネルのタイプ */,
	element: null /* キーポップアップのエレメント */,

	tdcolor: "black" /* 文字の色 */,
	imgCR: [1, 1] /* img表示用画像の横×縦のサイズ */,

	imgs: [] /* resize用 */,

	basepanel: null,
	clearflag: false,

	/* どの文字配置を作成するかのテーブル */
	type: {
		slither: [3, 0],
		nawabari: [4, 0],
		fourcells: [4, 0],
		fivecells: [4, 0],
		fillmat: [4, 0],
		paintarea: [4, 0],
		lightup: [4, 0],
		shakashaka: [4, 0],
		gokigen: [4, 0],
		wagiri: [4, 0],
		shugaku: [4, 0],
		creek: [4, 0],
		ichimaga: [4, 0],
		ichimagam: [4, 0],
		ichimagax: [4, 0],
		sukoro: [4, 4],
		sukororoom: [4, 4],
		lookair: [5, 0],
		hebi: [5, 5],
		tawa: [6, 0],
		hashikake: [8, 0],
		tapa: [8, 0],
		tapaloop: [8, 0],
		amibo: [10, 0],
		cave: [10, 0],
		bdblock: [10, 0],
		country: [10, 0],
		usotatami: [10, 0],
		heyawake: [10, 0],
		ayeheya: [10, 0],
		kurodoko: [10, 0],
		nagenawa: [10, 0],
		numlin: [10, 0],
		nurikabe: [10, 0],
		nuribou: [10, 0],
		norinuri: [10, 0],
		mochikoro: [10, 0],
		mochinyoro: [10, 0],
		shikaku: [10, 0],
		aho: [10, 0],
		shimaguni: [10, 0],
		chocona: [10, 0],
		yajitatami: [10, 0],
		tasquare: [10, 0],
		kurotto: [10, 0],
		bonsan: [10, 0],
		heyabon: [10, 0],
		rectslider: [10, 0],
		satogaeri: [10, 0],
		yosenabe: [10, 0],
		herugolf: [10, 0],
		firefly: [10, 0],
		tateyoko: [10, 0],
		factors: [10, 10],
		fillomino: [10, 10],
		symmarea: [10, 10],
		renban: [10, 10],
		ripple: [10, 10],
		cojun: [10, 10],
		makaro: [10, 10],
		sudoku: [10, 10],
		nanro: [10, 10],
		view: [10, 10],
		kakuru: [10, 10],
		kazunori: [10, 10],
		skyscrapers: [10, 10],
		kropki: [0, 10],
		tilepaint: [51, 0],
		triplace: [51, 0],
		kakuro: [51, 10],
		usoone: [4, 0],

		slalom: [101, 0],
		reflect: [102, 0],
		pipelink: [111, 0],
		pipelinkr: [111, 0],
		loopsp: [111, 0],
		tatamibari: [112, 0],
		hakoiri: [113, 113],
		kusabi: [114, 0],
		aqre: [10, 0],
		doppelblock: [10, 115],
		interbd: [116, 0],
		toichika2: [10, 10],
		crossstitch: [10, 0],
		ovotovata: [10, 0],
		lohkous: [10, 0],
		chainedb: [10, 0],
		canal: [10, 0],
		cbanana: [10, 0],
		bdwalk: [117, 0],
		voxas: [118, 0],
		oneroom: [10, 0],
		tontti: [10, 0],
		lapaz: [10, 0],
		tren: [10, 0],
		pentominous: [119, 119],
		hinge: [10, 0],
		tajmahal: [8, 0],
		railpool: [10, 0],
		coral: [10, 0],
		ququ: [10, 0],
		disloop: [10, 0],
		lither: [3, 0],
		snakepit: [120, 10],
		squarejam: [10, 0],
		context: [4, 0],
		numrope: [10, 10],
		yajisoko: [10, 0],
		roundtrip: [10, 0],
		cts: [121, 0],
		vslither: [4, 0],
		tslither: [4, 0],
		kaidan: [4, 0],
		anglers: [122, 0],
		heyablock: [10, 0],
		koburin: [4, 0],
		mirrorbk: [10, 0],
		takoyaki: [4, 0],
		lightshadow: [10, 0],
		familyphoto: [10, 0],
		icelom: [10, 0],
		icelom2: [10, 0],
		icewalk: [10, 0],
		ladders: [10, 0],
		akichi: [10, 0],
		slashpack: [10, 0],
		remlen: [10, 0],
		cocktail: [10, 0],
		news: [123, 123],
		dbchoco: [10, 0],
		nurimisaki: [10, 0],
		nonogram: [10, 0],
		box: [10, 0],
		aquarium: [10, 0],
		snake: [10, 0],
		tents: [10, 0],
		armyants: [10, 0],
		araf: [10, 0],
		bosanowa: [10, 10],
		meander: [10, 10],
		juosan: [10, 0],
		walllogic: [10, 0],
		mines: [8, 0],
		pencils: [10, 0],
		minarism: [10, 10],
		trainstations: [124, 0],
		wafusuma: [10, 0],
		kuroclone: [10, 0],
		martini: [10, 0],
		simplegako: [10, 10],
		tontonbeya: [113, 113],
		magnets: [125, 0],
		fracdiv: [51, 0],
		battleship: [126, 0],
		heyapin: [10, 0],
		detour: [10, 0],
		maxi: [10, 0],
		tetrochain: [10, 0],
		brownies: [127, 0],
		sashikazune: [10, 0],
		patchwork: [10, 0],
		waterwalk: [10, 0],
		haisu: [10, 0],
		wittgen: [4, 0],
		aquapelago: [10, 0],
		retroships: [129, 0],
		compass: [10, 0],
		mukkonn: [10, 0],
		tachibk: [10, 0],
		alter: [113, 113],
		mannequin: [10, 0],
		tetrominous: [128, 128],
		lineofsight: [10, 0],
		mrtile: [10, 0],
		subomino: [10, 0],
		lixloop: [130, 0],
		teri: [10, 0],
		portal: [10, 0],
		genderwalk: ["gender", 0]
	},

	//---------------------------------------------------------------------------
	// kp.display()     キーポップアップを表示する
	//---------------------------------------------------------------------------
	display: function() {
		var mode = ui.puzzle.editmode ? 1 : 3;
		if (
			this.element &&
			!!this.paneltype[mode] &&
			ui.menuconfig.get("keypopup")
		) {
			this.element.style.display = "block";

			getEL("panelbase1").style.display = mode === 1 ? "block" : "none";
			getEL("panelbase3").style.display = mode === 3 ? "block" : "none";
		} else if (!!this.element) {
			this.element.style.display = "none";
		}
	},

	//---------------------------------------------------------------------------
	// kp.create()      キーポップアップを生成して初期化する
	// kp.createtable() キーポップアップのポップアップを作成する
	//---------------------------------------------------------------------------
	create: function() {
		if (!!this.element) {
			getEL("panelbase1").innerHTML = "";
			getEL("panelbase3").innerHTML = "";
		}

		this.imgs = []; // resize用

		var type = this.type[ui.puzzle.pid];
		if (!type) {
			type = [0, 0];
		}

		this.paneltype = { 1: !ui.puzzle.playeronly ? type[0] : 0, 3: type[1] };
		if (!this.paneltype[1] && !this.paneltype[3]) {
			return;
		}

		if (!this.element) {
			var rect = pzpr.util.getRect(getEL("divques"));
			this.element = getEL("keypopup");
			this.element.style.left = rect.left + 48 + "px";
			this.element.style.top = rect.top + 48 + "px";
			pzpr.util.unselectable(this.element);
		}

		if (this.paneltype[1] !== 0) {
			this.createtable(1);
		}
		if (this.paneltype[3] !== 0) {
			this.createtable(3);
		}

		this.resizepanel();

		var bar = getEL("barkeypopup");
		ui.event.addEvent(bar, "mousedown", ui.popupmgr, ui.popupmgr.titlebardown);
		ui.event.addEvent(bar, "dblclick", ui.menuconfig, function() {
			this.set("keypopup", false);
		});
	},
	createtable: function(mode, type) {
		this.basepanel = getEL("panelbase" + mode);
		this.basepanel.innerHTML = "";

		this.tdcolor = mode === 3 ? ui.puzzle.painter.fontAnscolor : "black";

		this.generate(mode);
	},

	//---------------------------------------------------------------------------
	// kp.generate()    キーポップアップのテーブルを作成する
	// kp.gentable4()   キーポップアップの0～4を入力できるテーブルを作成する
	// kp.gentable10()  キーポップアップの0～9を入力できるテーブルを作成する
	// kp.gentable51()  キーポップアップの[＼],0～9を入力できるテーブルを作成する
	//---------------------------------------------------------------------------
	generate: function(mode) {
		var type = this.paneltype[mode];
		if (type === 4) {
			this.gentable4(mode);
		} else if (type === 10) {
			this.gentable10(mode);
		} else if (type === 51) {
			this.gentable51(mode);
		} else if (type === 3) {
			this.gentable3(mode);
		} else if (type === 5) {
			this.gentable5(mode);
		} else if (type === 6) {
			this.gentable6(mode);
		} else if (type === 8) {
			this.gentable8(mode);
		} else if (type === 101) {
			this.generate_slalom(mode);
		} else if (type === 102) {
			this.generate_reflect(mode);
		} else if (type === 111) {
			this.generate_pipelink(mode);
		} else if (type === 112) {
			this.generate_tatamibari(mode);
		} else if (type === 113) {
			this.generate_hakoiri(mode);
		} else if (type === 114) {
			this.generate_kusabi(mode);
		} else if (type === 115) {
			this.generate_doppelblock();
		} else if (type === 116) {
			this.generate_interbd();
		} else if (type === 117) {
			this.generate_bdwalk();
		} else if (type === 118) {
			this.generate_voxas();
		} else if (type === 119) {
			this.generate_pentominous(mode);
		} else if (type === 120) {
			this.generate_snakepit(mode);
		} else if (type === 121) {
			this.generate_cts(mode);
		} else if (type === 122) {
			this.generate_anglers(mode);
		} else if (type === 123) {
			this.generate_news(mode);
		} else if (type === 124) {
			this.generate_trainstations(mode);
		} else if (type === 125) {
			this.generate_magnets(mode);
		} else if (type === 126) {
			this.generate_battleship(mode);
		} else if (type === 127) {
			this.generate_brownies(mode);
		} else if (type === 128) {
			this.generate_tetrominous(mode);
		} else if (type === 129) {
			this.generate_retroships(mode);
		} else if (type === 130) {
			this.generate_lix(mode);
		} else if (type === "gender") {
			this.generate_genderwalk(mode);
		}
	},
	gentable4: function(mode) {
		var pid = ui.puzzle.pid,
			itemlist = ["1", "2", "3", "4"];
		if (mode === 3 && (pid === "sukoro" || pid === "sukororoom")) {
			var mbcolor = ui.puzzle.painter.mbcolor;
			itemlist.push(
				["q", { text: "○", color: mbcolor }],
				["w", { text: "×", color: mbcolor }],
				" ",
				null
			);
		} else {
			var cap = "?";
			if (ui.puzzle.painter.hideHatena) {
				switch (pid) {
					case "lightup":
					case "shakashaka":
						cap = "■";
						break;
					case "gokigen":
					case "wagiri":
					case "shugaku":
					case "creek":
						cap = "○";
						break;
				}
			}
			itemlist.push("0", null, " ", ["-", cap]);
		}
		this.generate_main(itemlist, 4);
	},
	gentable10: function(mode) {
		var pid = ui.puzzle.pid,
			itemlist = [];
		if (mode === 3 && ui.puzzle.klass.Cell.prototype.numberWithMB) {
			var mbcolor = ui.puzzle.painter.mbcolor;
			itemlist.push(
				["q", { text: "○", color: mbcolor }],
				["w", { text: "×", color: mbcolor }],
				" ",
				null
			);
		}
		if (
			mode === 1 &&
			(pid === "kakuru" ||
				pid === "tateyoko" ||
				pid === "crossstitch" ||
				pid === "numrope" ||
				pid === "yajisoko")
		) {
			itemlist.push(["q1", pid === "yajisoko" ? "□" : "■"]);
			if (pid === "crossstitch") {
				itemlist.push(["w2", "○"]);
			}
			itemlist.push(["-", "?"]);
		}

		itemlist.push("0", "1", "2", "3", "4", "5", "6", "7", "8", "9");
		if (mode === 3 && pid === "toichika2") {
			itemlist.push(["-", { text: "・", color: "rgb(255, 96, 191)" }]);
		}
		itemlist.push(
			mode === 1 || !ui.puzzle.klass.Cell.prototype.numberWithMB ? " " : null
		);

		var cap = null;
		if (
			mode === 3 ||
			pid === "kakuru" ||
			pid === "numrope" ||
			pid === "tateyoko" ||
			pid === "crossstitch" ||
			pid === "yajisoko"
		) {
		} else if (pid === "tasquare") {
			cap = "□";
		} else if (
			pid === "rectslider" ||
			pid === "aquapelago" ||
			pid === "mrtile"
		) {
			cap = "■";
		} else if (pid === "patchwork") {
			cap = {
				text: "■",
				color: "rgb(204,204,204)"
			};
		} else if (
			pid === "kurotto" ||
			pid === "bonsan" ||
			pid === "satogaeri" ||
			pid === "heyabon" ||
			pid === "yosenabe" ||
			pid === "herugolf" ||
			pid === "kazunori" ||
			pid === "nurimisaki" ||
			pid === "amibo" ||
			pid === "firefly" ||
			pid === "shikaku" ||
			pid === "aho" ||
			pid === "bosanowa" ||
			pid === "portal" ||
			pid === "minarism"
		) {
			cap = "○";
		} else if (!ui.puzzle.painter.hideHatena) {
			cap = "?";
		}
		if (cap !== null) {
			itemlist.push(["-", cap]);
		}
		if (pid === "familyphoto") {
			itemlist.push(["q", "●"]);
		}
		if (
			pid === "icelom" ||
			pid === "icelom2" ||
			pid === "icewalk" ||
			pid === "waterwalk" ||
			pid === "dbchoco"
		) {
			itemlist.push([
				"q",
				{
					text: "■",
					color: pid === "dbchoco" ? "rgb(204,204,204)" : "rgb(192,224,255)"
				}
			]);
		}
		this.generate_main(itemlist, 4);
	},
	gentable51: function(mode) {
		this.generate_main(
			[
				["q", { image: 0 }],
				" ",
				"1",
				"2",
				"3",
				"4",
				"5",
				"6",
				"7",
				"8",
				"9",
				"0"
			],
			4
		);
	},

	//---------------------------------------------------------------------------
	// kp.gentable3()  キーポップアップの0～4を入力できるテーブルを作成する
	// kp.gentable5()  キーポップアップの0～5を入力できるテーブルを作成する
	// kp.gentable6()  キーポップアップの0～6を入力できるテーブルを作成する
	// kp.gentable8()  キーポップアップの0～8を入力できるテーブルを作成する
	//---------------------------------------------------------------------------
	gentable3: function(mode) {
		this.generate_main(["1", "2", "3", "0", " ", ["-", "?"]], 3);
	},
	gentable5: function(mode) {
		this.generate_main(
			[
				"1",
				"2",
				"3",
				"4",
				"5",
				null,
				"0",
				" ",
				[
					"-",
					{
						text: mode === 1 ? "?" : "・",
						color: mode === 3 ? "rgb(255, 96, 191)" : ""
					}
				]
			],
			3
		);
	},
	gentable6: function(mode) {
		this.generate_main(["1", "2", "3", "4", "5", "6", "0", " ", ["-", "?"]], 3);
	},
	gentable8: function(mode) {
		var pid = ui.puzzle.pid;
		if (pid === "brownies") {
			this.generate_main(
				["1", "2", "3", "4", "5", "6", "7", "8", " ", ["-", "?"], ["w", "○"]],
				4
			);
		} else if (pid !== "tapa" && pid !== "tapaloop" && pid !== "mines") {
			this.generate_main(
				["1", "2", "3", "4", "5", "6", "7", "8", " ", ["-", "○"]],
				4
			);
		} else {
			this.generate_main(
				["1", "2", "3", "4", "5", "6", "7", "8", "0", " ", ["-", "?"]],
				4
			);
		}
	},

	//---------------------------------------------------------------------------
	// kp.generate_slalom()     スラローム用のテーブルを作成する
	// kp.generate_reflect()    リフレクトリンク用のテーブルを作成する
	//---------------------------------------------------------------------------
	generate_slalom: function(mode) {
		this.imgCR = [4, 1];
		this.generate_main(
			[
				["q", { image: 0 }],
				["s", { image: 1 }],
				["w", { image: 2 }],
				["e", { image: 3 }],
				["r", " "],
				"1",
				"2",
				"3",
				"4",
				"5",
				"6",
				"7",
				"8",
				"9",
				"0",
				"-",
				" "
			],
			5
		);
	},
	generate_reflect: function(mode) {
		this.imgCR = [4, 1];
		this.generate_main(
			[
				["q", { image: 0 }],
				["w", { image: 1 }],
				["e", { image: 2 }],
				["r", { image: 3 }],
				["t", "╋"],
				["y", " "],
				"1",
				"2",
				"3",
				"4",
				"5",
				"6",
				"7",
				"8",
				"9",
				"0",
				"-"
			],
			6
		);
	},

	//---------------------------------------------------------------------------
	// kp.generate_pipelink()   パイプリンク、帰ってきたパイプリンク、環状線スペシャル用のテーブルを作成する
	// kp.generate_tatamibari() タタミバリ用のテーブルを作成する
	// kp.generate_hakoiri()    はこいり○△□用のテーブルを作成する
	// kp.generate_kusabi()     クサビリンク用のテーブルを作成する
	//---------------------------------------------------------------------------
	generate_pipelink: function(mode) {
		var pid = ui.puzzle.pid,
			itemlist = [];
		itemlist.push(
			["q", "╋"],
			["w", "┃"],
			["e", "━"],
			["r", " "],
			pid !== "loopsp" ? ["-", "?"] : null,
			["a", "┗"],
			["s", "┛"],
			["d", "┓"],
			["f", "┏"]
		);
		if (pid === "pipelink") {
			itemlist.push(null);
		} else if (pid === "pipelinkr") {
			itemlist.push(["1", "○"]);
		} else if (pid === "loopsp") {
			itemlist.push(["-", "○"]);
		}

		if (pid === "loopsp") {
			itemlist.push("1", "2", "3", "4", "5", "6", "7", "8", "9", "0");
		}
		this.generate_main(itemlist, 5);
	},
	generate_tatamibari: function(mode) {
		this.generate_main(
			[
				["q", "╋"],
				["w", "┃"],
				["e", "━"],
				["r", " "],
				["-", "?"]
			],
			3
		);
	},
	generate_hakoiri: function(mode) {
		var pid = ui.puzzle.pid,
			itemlist = [];

		itemlist.push(["1", "○"], ["2", "△"], ["3", "□"]);
		if (pid === "hakoiri" || pid === "alter") {
			itemlist.push([
				"4",
				{
					text: mode === 1 ? "?" : "・",
					color: mode === 3 ? "rgb(255, 96, 191)" : ""
				}
			]);
		}
		itemlist.push(" ");
		this.generate_main(itemlist, 3);
	},
	generate_kusabi: function(mode) {
		this.generate_main(
			[["1", "同"], ["2", "短"], ["3", "長"], ["-", "○"], " "],
			3
		);
	},
	generate_doppelblock: function() {
		this.generate_main(
			[
				"1",
				"2",
				"3",
				"4",
				"5",
				"6",
				"7",
				"8",
				"9",
				"0",
				["q", "⋅"],
				["w", "■"],
				" "
			],
			5
		);
	},
	generate_interbd: function() {
		this.generate_main(
			[
				"1",
				"2",
				"3",
				"4",
				"0",
				["-", { text: "?", color: "gray" }],
				["q", { text: "●", color: "red" }],
				["w", { text: "◆", color: "blue" }],
				["e", { text: "▲", color: "green" }],
				["r", { text: "■", color: "#c000c0" }],
				["t", { text: "⬟", color: "#ff8000" }],
				["y", { text: "⬣", color: "#00c0c0" }],
				" "
			],
			4
		);
	},
	generate_bdwalk: function() {
		this.generate_main(
			[
				["-", { text: "■", color: "gray" }],
				["u", { text: "▲" }],
				["d", { text: "▼" }],
				"1",
				"2",
				"3",
				"4",
				"5",
				"6",
				"7",
				"8",
				"9",
				"0",
				" "
			],
			4
		);
	},
	generate_voxas: function() {
		this.generate_main(
			[
				["2", { text: "●" }],
				["3", { text: "●", color: "gray" }],
				["4", { text: "○" }],
				["1", { text: "━" }],
				" "
			],
			3
		);
	},
	generate_pentominous: function(mode) {
		var items = "filnptuvwxyz".split("").map(function(c) {
			return [c, { text: c.toUpperCase() }];
		});
		if (mode === 1) {
			items.push(["-", "?"], ["q", "■"]);
		}
		items.push(" ");

		this.generate_main(items, 5);
	},
	generate_tetrominous: function(mode) {
		var items = "ilost".split("").map(function(c) {
			return [c, { text: c.toUpperCase() }];
		});
		if (mode === 1) {
			items.push(["-", "?"], ["q", "■"]);
		}
		items.push(" ");

		this.generate_main(items, 4);
	},
	generate_snakepit: function() {
		this.generate_main(
			[
				"0",
				"1",
				"2",
				"3",
				"4",
				"5",
				"6",
				"7",
				"8",
				"9",
				" ",
				["-", "?"],
				["q", { text: "○" }],
				["w", { text: "■", color: "gray" }]
			],
			4
		);
	},
	generate_cts: function() {
		this.generate_main(
			[
				"1",
				"2",
				"3",
				"4",
				"5",
				"6",
				"7",
				"8",
				"9",
				"0",
				["-", "?"],
				["w", "*"],
				" "
			],
			5
		);
	},
	generate_anglers: function() {
		this.imgCR = [2, 1];
		this.generate_main(
			[
				"1",
				"2",
				"3",
				"4",
				"5",
				"6",
				"7",
				"8",
				"9",
				"0",
				["-", "?"],
				["q", { image: 0 }],
				["w", { image: 1 }],
				" "
			],
			5
		);
	},
	generate_news: function(mode) {
		var mbcolor = ui.puzzle.painter.mbcolor;
		this.generate_main(
			[
				mode === 3 ? ["z", { text: "○", color: mbcolor }] : " ",
				["n", "N"],
				" ",
				["w", "W"],
				["x", mode === 3 ? { text: "⋅", color: mbcolor } : "×"],
				["e", "E"],
				" ",
				["s", "S"],
				" "
			],
			3
		);
	},

	generate_trainstations: function(mode) {
		this.generate_main(
			[
				"0",
				"1",
				"2",
				"3",
				"4",
				"5",
				"6",
				"7",
				"8",
				"9",
				" ",
				["-", "?"],
				["q", "╋"]
			],
			4
		);
	},

	generate_magnets: function(mode) {
		this.generate_main(
			[
				"0",
				"1",
				"2",
				"3",
				"4",
				"5",
				"6",
				"7",
				"8",
				"9",
				" ",
				["q", { text: "■", color: "gray" }],
				["1", "╋"],
				["2", "━"]
			],
			4
		);
	},

	generate_battleship: function(mode) {
		this.imgCR = [10, 1];
		this.generate_main(
			[
				["7", { image: 6 }],
				["8", { image: 7 }],
				["1", { image: 4 }],
				"1",
				"2",
				"3",
				["9", { image: 8 }],
				["a", { image: 9 }],
				["2", { image: 5 }],
				"4",
				"5",
				"6",
				["3", { image: 2 }],
				["5", { image: 0 }],
				["4", { image: 3 }],
				"7",
				"8",
				"9",
				["6", { image: 1 }],
				["0", { text: "~", color: "blue" }],
				["-", "?"],
				" ",
				"0"
			],
			6
		);
	},

	generate_retroships: function(mode) {
		this.imgCR = [10, 1];
		this.generate_main(
			[
				["7", { image: 6 }],
				["8", { image: 7 }],
				["1", { image: 4 }],
				" ",
				["9", { image: 8 }],
				["a", { image: 9 }],
				["2", { image: 5 }],
				" ",
				["3", { image: 2 }],
				["5", { image: 0 }],
				["4", { image: 3 }],
				" ",
				["6", { image: 1 }],
				["0", { text: "~", color: "blue" }],
				["-", "?"],
				" "
			],
			4
		);
	},

	generate_brownies: function(mode) {
		this.generate_main(
			[
				"0",
				"1",
				"2",
				"3",
				"4",
				"5",
				"6",
				"7",
				"8",
				" ",
				["q", "○"],
				["w", "■"]
			],
			4
		);
	},

	generate_lix: function(mode) {
		this.generate_main(
			[["l", "L"], ["i", "I"], ["x", "X"], ["-", "?"], " "],
			3
		);
	},

	generate_genderwalk: function() {
		this.imgCR = [4, 4];
		this.generate_main(
			[
				["a", { image: 0 }],
				["b", { image: 1 }],
				["c", { image: 2 }],
				["d", { image: 3 }],
				["e", { image: 4 }],
				["f", { image: 5 }],
				["g", { image: 6 }],
				["h", { image: 7 }],
				["i", { image: 8 }],
				["j", { image: 9 }],
				["k", { image: 10 }],
				["l", { image: 11 }],
				["m", { image: 12 }],
				["n", { image: 13 }],
				["o", { image: 14 }],
				["p", { image: 15 }],
				" ",
				["-", "?"],
				["q", { text: "■", color: "rgb(255, 179, 255)" }]
			],
			4
		);
	},

	generate_main: function(list, split) {
		for (var i = 0; i < list.length; i++) {
			this.inputcol(list[i]);
			if ((i + 1) % split === 0) {
				this.insertrow();
			}
		}
		if (i % split !== 0) {
			this.insertrow();
		}
	},

	//---------------------------------------------------------------------------
	// kp.inputcol()  テーブルのセルを追加する
	// kp.insertrow() テーブルの行を追加する
	//---------------------------------------------------------------------------
	inputcol: function(item) {
		var type = "num",
			ca,
			disp,
			color = this.tdcolor;
		if (!item) {
			type = "empty";
		} else {
			if (typeof item === "string") {
				ca = disp = item;
			} else if (typeof item[1] === "string") {
				ca = item[0];
				disp = item[1];
			} else if (!!item[1].text) {
				ca = item[0];
				disp = item[1].text;
				color = item[1].color;
			} else if (item[1].image !== void 0) {
				ca = item[0];
				disp = item[1].image;
				type = "image";
			}
		}

		var _div = null,
			_child = null;
		if (type !== "empty") {
			_div = createEL("div");
			_div.className = "kpcell kpcellvalid";
			_div.onclick = function(e) {
				e.preventDefault();
			};
			ui.event.addEvent(_div, "mousedown", ui.puzzle, function(e) {
				this.key.keyevent(ca, 0);
				e.preventDefault();
				e.stopPropagation();
			});
			pzpr.util.unselectable(_div);
		} else {
			_div = createEL("div");
			_div.className = "kpcell kpcellempty";
			pzpr.util.unselectable(_div);
		}

		if (type === "num") {
			_child = createEL("span");
			_child.className = "kpnum";
			_child.style.color = color;
			_child.innerHTML = disp;
			pzpr.util.unselectable(_child);
		} else if (type === "image") {
			_child = createEL("img");
			_child.className = "kpimg";
			var pid = ui.puzzle.pid;
			if (pid === "retroships") {
				pid = "battleship";
			}

			_child.src =
				"data:image/gif;base64," +
				this.dataurl[!!this.dataurl[pid] ? pid : "shitappa"];
			pzpr.util.unselectable(_child);
			var x = disp % this.imgCR[0],
				y = (disp - x) / this.imgCR[1];
			this.imgs.push({ el: _child, x: x, y: y });
		}

		if (this.clearflag) {
			_div.style.clear = "both";
			this.clearflag = false;
		}
		if (!!_child) {
			_div.appendChild(_child);
		}
		this.basepanel.appendChild(_div);
	},
	insertrow: function() {
		this.clearflag = true;
	},

	//---------------------------------------------------------------------------
	// kp.resizepanel() キーポップアップのセルのサイズを変更する
	//---------------------------------------------------------------------------
	resizepanel: function() {
		var cellsize = Math.min(ui.puzzle.painter.cw, 120);
		if (cellsize < 20) {
			cellsize = 20;
		}

		var dsize = (cellsize * 0.9) | 0,
			tsize = (cellsize * 0.7) | 0;
		for (var i = 0, len = this.imgs.length; i < len; i++) {
			var obj = this.imgs[i],
				img = obj.el;
			img.style.width = "" + dsize * this.imgCR[0] + "px";
			img.style.height = "" + dsize * this.imgCR[1] + "px";
			img.style.clip =
				"rect(" +
				(dsize * obj.y + 1) +
				"px," +
				dsize * (obj.x + 1) +
				"px," +
				dsize * (obj.y + 1) +
				"px," +
				(dsize * obj.x + 1) +
				"px)";
			img.style.top = "-" + obj.y * dsize + "px";
			img.style.left = "-" + obj.x * dsize + "px";
		}

		ui.misc.modifyCSS({
			"div.kpcell": {
				width: "" + dsize + "px",
				height: "" + dsize + "px",
				lineHeight: "" + dsize + "px"
			},
			"span.kpnum": { fontSize: "" + tsize + "px" }
		});
	},

	dataurl: {
		slalom:
			"R0lGODlhAAFAAMIEAAICAmBgYJ+fn///////AP//AP//AP//ACH5BAEKAAQALAAAAAAAAUAAAAP+OLrc/jDKSau9OOvNu/9gKI5kaZ5oqq5s675wLM90bd94ru+24AdAH68BKBqHNqNyyWw6n9DSD2oMCHhMZI3K7XqLI0Hgq7TmstoZec0GhMTt8jW5TKvj+OhnnFfOaWh2MH2EdR0ChUtmd0qCMYmJHXxOQFZ/P5OUjEeOL5CFHJmKfxFTmp2oIZ+EG6JVpBVwTQGptR2rfRquAIsbiLO2wRi4eRm7tB+yS7DCzQ7EeBi/yyO7zCiBziTQcRfTfiWuyCzZ2iLcbReu1yDrLeXmIOhsFt9F7CGu74bx5/NkFkSNO2EPAL4R8Prd+vclFpODbxKWkKhQA8OGFAS2EAX+UR6/ih4ueqFQsGPEMiCDieySUZGLkilrreTSEpwLjjFTzaRCweULewNz2tmpR4JPTyhTUBQ6geiTCUBjiFKxlGkEp06gUoMxVelHqxawNpmAE4Y9kxyqevw4dkFbt+XeQhBbtezPrSfUfpDLN67fr8/oNpLQ1SxeE3pDZuv7Ve4Ax4EFgyF8uMVZr4MxZ368+O9mzoCJSJ5cqjILeyAZb3bMuupo0hAucw3tTDUnBa0bu36tNemLwmCRvHbT1Lflo8GHDO9JG0XU5MJ5kzWdwm7e5tBFjyaJXAVMzbCzX5Ve3OaK5+CJizdKnrLx9GgXfl4fWbJD6iQ0rkgMfXmvBX0pfEcVdvT5x113+SF43Xz0MWBgTeYliF+DgLTH3IShMBEUhTc8eCCGxjQRH4fkWAjhe744MSKJ+5l4YoQhisjiDh4GRMmKBRmx4lq3zQiafa08YQlUu+goA3/J1agOFUH44CQQXOyoCoHrKelNkXj08giV4lkpTSJaHslldl5Kg2UXYW4SHotlapAjk1Iu2KOPVplCyZB05pmDk0Lo6eefgAYq6KCEFmrooSwkAAA7",
		anglers:
			"R0lGODdhgABAAPQAAP///wICAp+fn4CAgLCwsMDAwD8/PwAAABAQEFBQUKCgoO/v7yAgIDAwMJCQkN/f329vb39/fx8fH8/Pzy8vL6+vr7+/vw8PD2BgYF9fX0BAQE9PT4+PjwAAAAAAAAAAACwAAAAAgABAAAAF/yAgjmRpnmiqrmzrvnAsz3Rt33iu73zv/8CgcEgsGoOBpHLJbDqfUOexGK1ar80pEcvtSrVCr9gLDo/P1plgQCgUyim0HDozHO74hGIBH83/TDFrDHiFdw0OD3CAjAExEIaReAN8Wo2Aj3gSBnaSd5RTl3+ZnyMTERSSDBVHonMxFnknAhKRoFuuaLCyKBEXhhiVZrlju3grvoUNwkDEZzK1d6wqE7+aE8POXTKQdxktqZrMPdpiMhXiLRnKSOXb0HjY6oXBP+7vMRu84IUC9vdY1BSy8CLcHXk8AAass49FtYY6FF6hESvei4oHyUmsUqPTAQbjVHjUoHEjHRoP2O+5wHjA3w6TUWx08/Zi3aGEMJ/cMNjSRUqLEXN+sRFNmgt9pYIKDXTj4aQWAiDaWJoFBzp6DguFpEGVqVVDy1YYdImj65IdTp+mSHYgglKzPB7wTGoCo4G3XX0gVTYAoQi7eKn+iKoKQxsATsOWNZskCFtPYDVInizZLwvGjYXMhMz5AMEXmB0REWCzs6TPLkJPsQCBk2mgqTH3ATDQgu3btrfGkd1Haw7VvY/95r1I+GLGs30fhxv8TuClyY3fAF7c+XDkzQ88Fzo7gne315nPxol9/Evi5sPnTb89J/v38OPLn0+/vv37+PPr3z8+BAA7",
		battleship:
			"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",
		reflect:
			"R0lGODlhAAFAAIABAAAAAP///yH5BAEKAAEALAAAAAAAAUAAAAL+jI+py+0Po5y02ouz3rz7D4biSJbmiabqyrbuC8fyTNf2jef6bgD8H/A9AMSi8YhMKpdJCPMJjSKdQiCOGJFqt9Mh96vNYq22ogSMflLT7OPZTJ4ZJ+362GGv0+dxmHufh7YW+EXR1cdy+EbINcgoVdGEqCJp+BjmdRlloTSJ0smpCeUoWmlp6hmyhFHKRNoKFwqaCuLKCqvIgJt7OkvLoZaxy4c3fHcx+ruRLGz8WrrMrCxrq+GciQu8OR25HZ2N3dqByS3m/S0eLuqxVf7si76ufvnR6K7bXp9eDK2ff4+gUK1+/DSpEggwCEJ/9OYFEiEIYMSDDQsyGpHmXkb+jBUbGOQ4URmbEh3xXSTRZlpKkict2jGhh1ZMlg8dbqQ50tPLE4Tegfm0s0+eFDVd3oQ5NE5RnkE9NkWaFEhPSjOdriQ6lUdLrDmN2qOaNcejFlethuQatsxYskdN/mS7Vm3cRGcXtAU7V4Y8F3UV9EWb9wVBvgvdkiO8V/BgxIcNn2P8EXJJycG8rtILi3JgzfDsNlacecWuGp/9QqIxDO8+OY89S8M8mmls0q9dV0N9DWVu2rcd84KdGmTwG5XNosJtrArD4cQvW1YuN/nA5NCj/7G8g3qseLuvHDf9m7d2bdqrN79u/JjY8uq7sZeK3jF89ubNvZ/fHnx+7/Q96z9nrtV2bpHRn4A2SUfgfgEpyF+BiziolH8HMNgghP8hqJQTCW3IYYcefghiiCKOSGKJJp6IYooqrlhOAQA7",
		shitappa:
			"R0lGODlhQABAAIABAAAAAP//ACH5BAEKAAEALAAAAABAAEAAAAL6jI+py+0Po5y02ouz3rz7DwHiSJbmiaZnqLbuW7LwTMdPjdcyCUb8veo5fkOUsEFEjgK2YyLJ+DWdBuiCOHVaFcmscPtcIrwg8Fh8Rn/VUXbVvIG/RW13R860z+k9PJys4ad3AIghyFc0aHEI4IMnwQj5uEMpqWjZCIToeFmZmDlRyAmqtIlJWhG5OMnVyRrWeeUaW2c66nkhKmvbykuhC4u6K7xKm+ebRlyMHIwb+Kh6F12qbCg3La2InY28za3s/T3sXGYV7pF1jt41y7yOpv5hEy/PQ18f9Ek1fF8OnAPwxY6ABP8VPMgIYcF9DBs6fAgxosSJFBMUAAA7",
		genderwalk:
			"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"
	}
};

// Timer.js v3.4.0

(function() {
	//---------------------------------------------------------------------------
	// ★Timerクラス  一般タイマー(経過時間の表示/自動正答判定用)
	//---------------------------------------------------------------------------
	var timerInterval = 100; /* タイマー割り込み間隔 */

	ui.timer = {
		/* メンバ変数 */
		TID: null /* タイマーID */,
		current: 0 /* 現在のgetTime()取得値(ミリ秒) */,

		/* 経過時間表示用変数 */
		bseconds: 0 /* 前回ラベルに表示した時間(秒数) */,
		timerEL: null /* 経過時間表示用要素 */,

		/* 自動正答判定用変数 */
		worstACtime: 0 /* 正答判定にかかった時間の最悪値(ミリ秒) */,
		nextACtime: 0 /* 次に自動正答判定ルーチンに入ることが可能になる時間 */,

		//---------------------------------------------------------------------------
		// tm.reset()      タイマーのカウントを0にして、スタートする
		// tm.start()      update()関数を200ms間隔で呼び出す
		// tm.update()     200ms単位で呼び出される関数
		//---------------------------------------------------------------------------
		init: function() {
			this.worstACtime = 0;
			this.timerEL = document.getElementById("timerpanel");
			this.showtime(0);
		},
		start: function() {
			var self = this;
			if (!!this.TID) {
				return;
			}
			ui.puzzle.resetTime();
			this.update();
			this.TID = setInterval(function() {
				self.update();
			}, timerInterval);
		},
		stop: function() {
			if (!this.TID) {
				return;
			}
			clearInterval(this.TID);
			this.TID = null;
		},
		update: function() {
			this.current = pzpr.util.currentTime();

			if (ui.puzzle.playeronly) {
				this.updatetime();
			}

			ui.menuconfig.save();

			if (ui.menuconfig.get("autocheck_once")) {
				var mode = ui.menuconfig.get("autocheck_mode");
				this.autocheck(mode === "guarded");
			}
		},

		//---------------------------------------------------------------------------
		// tm.updatetime() 秒数の表示を行う
		// tm.label()      経過時間に表示する文字列を返す
		//---------------------------------------------------------------------------
		showtime: function(seconds) {
			var hours = (seconds / 3600) | 0;
			var minutes = ((seconds / 60) | 0) - hours * 60;
			seconds = seconds - minutes * 60 - hours * 3600;

			if (minutes < 10) {
				minutes = "0" + minutes;
			}
			if (seconds < 10) {
				seconds = "0" + seconds;
			}

			this.timerEL.innerHTML = [
				this.label(),
				!!hours ? hours + ":" : "",
				minutes,
				":",
				seconds
			].join("");
		},
		updatetime: function() {
			var seconds = (ui.puzzle.getTime() / 1000) | 0;
			if (this.bseconds === seconds) {
				return;
			}
			this.showtime(seconds);
			this.bseconds = seconds;
		},
		label: function() {
			return ui.i18n("time") + (pzpr.lang === "en" ? " " : "");
		},

		//---------------------------------------------------------------------------
		// tm.autocheck()    自動正解判定を呼び出す
		//---------------------------------------------------------------------------
		autocheck: function(guarded) {
			var puzzle = ui.puzzle;
			if (
				this.current > this.nextACtime &&
				puzzle.playmode &&
				!puzzle.checker.inCheck &&
				puzzle.board.trialstage === 0 &&
				!puzzle.getConfig("variant")
			) {
				var check = puzzle.check(false);
				if (check.complete && (!guarded || !check.undecided)) {
					ui.timer.stop();
					puzzle.mouse.mousereset();
					ui.menuconfig.set("autocheck_once", false);
					if (ui.callbackComplete) {
						ui.callbackComplete(puzzle, check);
					}
					ui.notify.alert(ui.i18n("completed"));
					return;
				}

				this.worstACtime = Math.max(
					this.worstACtime,
					pzpr.util.currentTime() - this.current
				);
				this.nextACtime =
					this.current +
					(this.worstACtime < 250
						? this.worstACtime * 4 + 120
						: this.worstACtime * 2 + 620);
			}
		}
	};

	//---------------------------------------------------------------------------
	// ★UndoTimerクラス   Undo/Redo用タイマー
	//---------------------------------------------------------------------------
	var undoTimerInterval = 25 /* タイマー割り込み間隔 */,
		execWaitTime = 300; /* 1回目にwaitを多く入れるための値 */

	ui.undotimer = {
		/* メンバ変数 */
		TID: null /* タイマーID */,

		inUNDO: false /* Undo実行中 */,
		inREDO: false /* Redo実行中 */,

		//---------------------------------------------------------------------------
		// ut.reset()  タイマーをスタートする
		//---------------------------------------------------------------------------
		reset: function() {
			this.stop();
		},

		//---------------------------------------------------------------------------
		// ut.startUndo() Undo開始共通処理
		// ut.startRedo() Redo開始共通処理
		// ut.stopUndo() Undo停止共通処理
		// ut.stopRedo() Redo停止共通処理
		//---------------------------------------------------------------------------
		startUndo: function() {
			if (!(this.inUNDO || this.inREDO)) {
				this.inUNDO = true;
				this.proc();
			}
		},
		startRedo: function() {
			if (!(this.inREDO || this.inUNDO)) {
				this.inREDO = true;
				this.proc();
			}
		},
		stopUndo: function() {
			if (this.inUNDO) {
				this.inUNDO = false;
				this.proc();
			}
		},
		stopRedo: function() {
			if (this.inREDO) {
				this.inREDO = false;
				this.proc();
			}
		},

		//---------------------------------------------------------------------------
		// ut.start() Undo/Redo呼び出しを開始する
		// ut.stop()  Undo/Redo呼び出しを終了する
		//---------------------------------------------------------------------------
		start: function() {
			var self = this;
			function handler() {
				self.proc();
			}
			function inithandler() {
				clearInterval(self.TID);
				self.TID = setInterval(handler, undoTimerInterval);
			}
			this.TID = setInterval(inithandler, execWaitTime);
			this.exec();
		},
		stop: function() {
			this.inUNDO = false;
			this.inREDO = false;

			clearInterval(this.TID);
			this.TID = null;
		},

		//---------------------------------------------------------------------------
		// ut.proc()  Undo/Redo呼び出しを実行する
		// ut.exec()  Undo/Redo関数を呼び出す
		//---------------------------------------------------------------------------
		proc: function() {
			if ((this.inUNDO || this.inREDO) && !this.TID) {
				this.start();
			} else if (!(this.inUNDO || this.inREDO) && !!this.TID) {
				this.stop();
			} else if (!!this.TID) {
				this.exec();
			}
		},
		exec: function() {
			if (!this.checknextprop()) {
				this.stop();
			} else if (this.inUNDO) {
				ui.puzzle.undo();
			} else if (this.inREDO) {
				ui.puzzle.redo();
			}
		},

		//---------------------------------------------------------------------------
		// ut.checknextprop()  次にUndo/Redoができるかどうかの判定を行う
		//---------------------------------------------------------------------------
		checknextprop: function() {
			var opemgr = ui.puzzle.opemgr;
			var isenable =
				(this.inUNDO && opemgr.enableUndo) ||
				(this.inREDO && opemgr.enableRedo);
			return isenable;
		}
	};
})();

/* jshint devel:true */
/* global getEL:readonly */

ui.popupmgr.addpopup("auxeditor", {
	formname: "auxeditor",

	close: function() {
		if (ui.auxeditor.cb && ui.auxeditor.puzzle) {
			ui.auxeditor.cb(ui.auxeditor.puzzle);
			ui.auxeditor.cb = null;
		}
		ui.auxeditor.current = null;

		ui.popupmgr.popups.template.close.apply(this);
	},

	delete: function() {
		if (!ui.auxeditor.puzzle.opemgr.enableUndo) {
			ui.auxeditor.puzzle.board.ansclear();
			this.close();
		} else {
			var thiz = this;
			ui.notify.confirm(ui.i18n("auxdelete.confirm"), function() {
				ui.auxeditor.puzzle.board.ansclear();
				thiz.close();
			});
		}
	},

	init: function() {
		ui.popupmgr.popups.template.init.call(this);

		function btnfactory(role) {
			return function(e) {
				ui.toolarea[role](e);
				if (e.type !== "click") {
					e.preventDefault();
					e.stopPropagation();
				}
			};
		}
		function addbtnevent(el, type, role) {
			pzpr.util.addEvent(el, type, ui.toolarea, btnfactory(role));
		}

		ui.misc.walker(this.form, function(el) {
			if (el.nodeType === 1) {
				if (el.className === "config") {
					ui.toolarea.items[ui.customAttr(el, "config")] = { el: el };
				} else if (el.className.match(/child/)) {
					var parent = el.parentNode.parentNode,
						idname = ui.customAttr(parent, "config");
					var item = ui.toolarea.items[idname];
					if (!item.children) {
						item.children = [];
					}
					item.children.push(el);

					addbtnevent(el, "mousedown", "toolclick");
				}
			}
		});
	},

	adjust_aux: function(e) {
		ui.auxeditor.puzzle.board.operate(e.target.name);
	}
});

ui.auxeditor = {
	current: null,
	cb: null,

	close: function(abort) {
		if (ui.popupmgr.popups.auxeditor.pop) {
			if (abort) {
				this.cb = null;
			}
			ui.popupmgr.popups.auxeditor.close();
		}
	},

	open: function(sender, args, cb) {
		if (!args || args.abort) {
			ui.auxeditor.close(args && args.abort);
			return;
		}

		if (ui.auxeditor.current === args.key) {
			return;
		}

		if (ui.popupmgr.popups.applypreset.pop) {
			ui.popupmgr.popups.applypreset.close();
		}

		var cellsize = ui.puzzle.painter.cw;
		if (cellsize > 32) {
			cellsize = Math.floor(cellsize * 0.75);
		}

		var rect = pzpr.util.getRect(getEL("divques"));
		ui.popupmgr.open("auxeditor", 4, rect.top);

		if (!ui.auxeditor.puzzle) {
			var element = document.getElementById("divauxeditor");
			ui.auxeditor.puzzle = new pzpr.Puzzle(element, {
				type: "player",
				cellsize: cellsize
			});
		}
		var pz = ui.auxeditor.puzzle;

		pz.open(args.pid + "/" + args.url, function() {
			ui.popupmgr.popups.auxeditor.titlebar.innerText = ui.selectStr(
				pz.info.ja,
				pz.info.en
			);
			ui.auxeditor.puzzle.setCanvasSizeByCellSize(cellsize);

			var bounds = pzpr.util.getRect(getEL("popauxeditor"));
			ui.popupmgr.open(
				"auxeditor",
				Math.max(4, rect.left - bounds.width),
				bounds.top
			);
		});

		ui.auxeditor.current = args.key;
		ui.auxeditor.cb = cb;
		ui.menuconfig.set("auxeditor_inputmode", "auto");
	}
};

ui.popupmgr.addpopup("applypreset", {
	formname: "applypreset",

	reset: function() {
		this.loadpresets();
	},

	translate: function() {
		ui.popupmgr.popups.template.translate.call(this);
		if (ui.puzzle.klass.Bank.prototype.enabled) {
			this.loadpresets();
		}
	},

	apply: function() {
		if (this.form.preset.value === "") {
			this.close();
			return;
		}
		var preset = ui.puzzle.board.bank.presets[+this.form.preset.value];
		ui.puzzle.board.bank.applyPreset(preset);
		this.close();
	},

	loadpresets: function() {
		var root = getEL("ap_preset");
		root.replaceChildren();

		var presets = ui.puzzle.board.bank.presets;
		for (var i = 0; i < presets.length; i++) {
			var div = document.createElement("div");
			var label = document.createElement("label");
			var input = document.createElement("input");

			input.name = "preset";
			input.value = i;
			input.type = "radio";

			label.textContent = ui.i18n(presets[i].name) || presets[i].name;
			label.prepend(input);

			div.replaceChildren(label);
			root.appendChild(div);
		}
	}
});

(function() {
	ui.network = {
		ws: null,
		mode: "",
		key: "",
		maxSeen: -1,

		configure: function(mode, key) {
			this.mode = mode;
			this.key = key;
			ui.setdisplay("network");
		},

		start: function() {
			if (!this.mode) {
				return;
			}

			var loc = window.location;
			var wsurl = "ws://";
			if (document.location.protocol === "https:") {
				wsurl = "wss://";
			}
			wsurl = wsurl + loc.host + "/game/" + this.key;

			this.ws = new WebSocket(wsurl);
			this.ws.onclose = this.onclose;
			this.ws.onmessage = this.onmessage;
		},

		onCellOp: function(op) {
			if (!!this.ws) {
				this.ws.send(op);
			}
		},

		onclose: function(event) {
			ui.network.start();
		},

		onmessage: function(event) {
			var msg = JSON.parse(event.data);
			var id = msg.id;
			if (id > ui.network.maxSeen) {
				ui.network.maxSeen = id;
				ui.network.applyOp(msg.operation);
			}
		},

		applyOp: function(encOp) {
			var op = new ui.puzzle.klass.ObjectOperation();
			op.decode(encOp.split(","));
			op.external = true;

			ui.puzzle.opemgr.disableRecord();
			op.redo();
			ui.puzzle.opemgr.enableRecord();

			ui.puzzle.opemgr.newOperation();
			ui.puzzle.opemgr.add(op);
		}
	};
})();

// outro.js

})();

//# sourceMappingURL=pzpr-ui.concat.js.map