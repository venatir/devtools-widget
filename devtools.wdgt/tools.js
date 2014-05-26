var gDoneButton,
    gInfoButton,
//noinspection SpellCheckingInspection
    apple = {
        setup: function () {
            gDoneButton = new AppleGlassButton(document.getElementById("doneButton"), "Done", this.hidePrefs);
            gInfoButton = new AppleInfoButton(document.getElementById("infoButton"), document.getElementById("front"), "white", "white", this.showPrefs);
        },
        showPrefs: function () {
            var front = document.getElementById("front");
            var back = document.getElementById("back");

            if (window.widget) {
                widget.prepareForTransition("ToBack");
            }

            front.style.display = "none";
            back.style.display = "block";
            pasteBin.populateTimeframes("pasteBin-timeFrameB");
            pasteBin.populateProgrammingLanguages("pasteBin-programmingLanguageB");
            if (window.widget) {
                setTimeout('widget.performTransition();', 0);
            }
        },
        hidePrefs: function () {

            var front = document.getElementById("front");
            var back = document.getElementById("back");
            if (window.widget) {
                widget.prepareForTransition("ToFront");
            }

            back.style.display = "none";
            front.style.display = "block";
            pasteBin.populateTimeframes("pasteBin-timeFrame");
            pasteBin.populateProgrammingLanguages("pasteBin-programmingLanguage");
            if (window.widget) {
                setTimeout('widget.performTransition();', 0);
            }
        },
        save: function (key, value) {
            if (window.widget) {
                widget.setPreferenceForKey(value, key);
            }
        },
        load: function (key) {
            var value;
            if (window.widget) {
                value = widget.preferenceForKey(key);
            }
            return value;
        }
    },
    password = {
        keys: "abcdefghijklmnopqrstuvwxyz",
        symbols: "~`!@#$%^&*()_-+={[}]|\\:;\"'<,>.?/",
        capitals: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
        numbers: "0123456789",
        generate: function () {
            var temp = '',
                i,
                tempKeys,
                length,
                savedLength = apple.load("savedLength"),
                savedNumbers = apple.load("savedNumbers"),
                savedCapitals = apple.load("savedCapitals"),
                savedSymbols = apple.load("savedSymbols");

            tempKeys = this.keys;

            if (savedLength > 0) {
                length = savedLength;
            }
            else {
                length = 8;
            }

            if (savedCapitals === true) {
                tempKeys = tempKeys.concat(this.capitals);
            }

            if (savedNumbers === true) {
                tempKeys = tempKeys.concat(this.numbers);
            }
            if (savedSymbols === true) {
                tempKeys = tempKeys.concat(this.symbols);
            }

            for (i = 0; i < length; i++) {
                temp += tempKeys.charAt(Math.floor(Math.random() * tempKeys.length))
            }

            return updateOutput("passwordOutput", temp);
        }
    },
    pasteBin = {
        api_dev_key: '72da529c1e3107c3dd9c4170d16608c3',// please do not abuse. You can get yours for free by just creating a pastebin.com account
        execute: function (raw, filenameTitle, expireTime, format) {
            if (raw.length === 0) {
                return;
            }
            var api_paste_code = encodeURIComponent(raw + "\n\n\nI am pasting via https://github.com/venatir/devtools-widget"), // your paste text
                api_paste_private = '1', // 0=public 1=unlisted 2=private
                api_paste_name = encodeURIComponent(filenameTitle || "I am pasting via https://github.com/venatir/devtools-widget"), // name or title of your paste
                api_paste_expire_date = expireTime || '1H',
                api_paste_format = format || 'php',
                api_user_key = apple.load("savedPasteBin-userKey"), // if an invalid api_user_key or no key is used, the paste will be create as a guest
                url = 'http://pastebin.com/api/api_post.php',
                xmlhttp = new XMLHttpRequest();

            // TODO: comment out my text

            xmlhttp.open("POST", url, true);
            xmlhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            xmlhttp.onreadystatechange = function () {
                if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                    updateOutput("pasteBin-raw", xmlhttp.responseText);
                }
            };
            xmlhttp.send(
                "api_option=paste&" +
                "api_dev_key=" + this.api_dev_key + "&" +
                "api_paste_code=" + api_paste_code + "&" +
                "api_paste_private=" + api_paste_private + "&" +
                "api_paste_name=" + api_paste_name + "&" +
                "api_paste_expire_date=" + api_paste_expire_date + "&" +
                "api_paste_format=" + api_paste_format + "&" +
                "api_user_key=" + api_user_key
            );
        },
        populateTimeframes: function (id) {
            var i,
                data,
                option,
                savedTimeframe,
                select = document.getElementById(id);

            while (select.length > 0) {
                select.remove(select.length - 1);
            }
            for (i = 0; i < pasteBin.timeFrames.length; i++) {
                data = pasteBin.timeFrames[i];
                option = new Option(data.text, data.value);
                savedTimeframe = apple.load("savedTimeframe");

                if (savedTimeframe) {
                    if (data.value === savedTimeframe) {
                        option.selected = true;
                    }
                } else {
                    if (data.selected === true) {
                        option.selected = true;
                    }
                }
                document.getElementById(id).options.add(option);
            }
        },
        populateProgrammingLanguages: function (id) {
            var i,
                data,
                option,
                savedProgrammingLanguage,
                select = document.getElementById(id);

            while (select.length > 0) {
                select.remove(select.length - 1);
            }
            for (i = 0; i < pasteBin.programmingLanguages.length; i++) {
                data = pasteBin.programmingLanguages[i];
                option = new Option(data.text, data.value);
                savedProgrammingLanguage = apple.load("savedProgrammingLanguage");

                if (savedProgrammingLanguage) {
                    if (data.value === savedProgrammingLanguage) {
                        option.selected = true;
                    }
                } else {
                    if (data.selected === true) {
                        option.selected = true;
                    }
                }

                if (data.selected === true) {
                    option.selected = true;
                }
                document.getElementById(id).options.add(option);
            }
        },
        getUserKey: function (callback) {
            var xmlhttp = new XMLHttpRequest();

            xmlhttp.open("POST", "http://pastebin.com/api/api_login.php", true);
            xmlhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            xmlhttp.onreadystatechange = function () {
                if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                    apple.save("savedPasteBin-userKey", xmlhttp.responseText);
                    callback(xmlhttp.responseText);
                }
            };
            xmlhttp.send(
                "api_dev_key=" + this.api_dev_key + "&" +
                "api_user_name=" + document.getElementById("pasteBin-username").value + "&" +
                "api_user_password=" + document.getElementById("pasteBin-password").value
            );
        },
        programmingLanguages: [
            {value: "4cs", text: "4CS"},
            {value: "6502acme", text: "6502 ACME Cross Assembler"},
            {value: "6502kickass", text: "6502 Kick Assembler"},
            {value: "6502tasm", text: "6502 TASM/64TASS"},
            {value: "abap", text: "ABAP"},
            {value: "actionscript", text: "ActionScript"},
            {value: "actionscript3", text: "ActionScript 3"},
            {value: "ada", text: "Ada"},
            {value: "algol68", text: "ALGOL 68"},
            {value: "apache", text: "Apache Log"},
            {value: "applescript", text: "AppleScript"},
            {value: "apt_sources", text: "APT Sources"},
            {value: "arm", text: "ARM"},
            {value: "asm", text: "ASM (NASM)"},
            {value: "asp", text: "ASP"},
            {value: "asymptote", text: "Asymptote"},
            {value: "autoconf", text: "autoconf"},
            {value: "autohotkey", text: "Autohotkey"},
            {value: "autoit", text: "AutoIt"},
            {value: "avisynth", text: "Avisynth"},
            {value: "awk", text: "Awk"},
            {value: "bascomavr", text: "BASCOM AVR"},
            {value: "bash", text: "Bash"},
            {value: "basic4gl", text: "Basic4GL"},
            {value: "bibtex", text: "BibTeX"},
            {value: "blitzbasic", text: "Blitz Basic"},
            {value: "bnf", text: "BNF"},
            {value: "boo", text: "BOO"},
            {value: "bf", text: "BrainFuck"},
            {value: "c", text: "C"},
            {value: "c_mac", text: "C for Macs"},
            {value: "cil", text: "C Intermediate Language"},
            {value: "csharp", text: "C#"},
            {value: "cpp", text: "C++"},
            {value: "cpp-qt", text: "C++ (with QT extensions)"},
            {value: "c_loadrunner", text: "C: Loadrunner"},
            {value: "caddcl", text: "CAD DCL"},
            {value: "cadlisp", text: "CAD Lisp"},
            {value: "cfdg", text: "CFDG"},
            {value: "chaiscript", text: "ChaiScript"},
            {value: "clojure", text: "Clojure"},
            {value: "klonec", text: "Clone C"},
            {value: "klonecpp", text: "Clone C++"},
            {value: "cmake", text: "CMake"},
            {value: "cobol", text: "COBOL"},
            {value: "coffeescript", text: "CoffeeScript"},
            {value: "cfm", text: "ColdFusion"},
            {value: "css", text: "CSS"},
            {value: "cuesheet", text: "Cuesheet"},
            {value: "d", text: "D"},
            {value: "dcl", text: "DCL"},
            {value: "dcpu16", text: "DCPU-16"},
            {value: "dcs", text: "DCS"},
            {value: "delphi", text: "Delphi"},
            {value: "oxygene", text: "Delphi Prism (Oxygene)"},
            {value: "diff", text: "Diff"},
            {value: "div", text: "DIV"},
            {value: "dos", text: "DOS"},
            {value: "dot", text: "DOT"},
            {value: "e", text: "E"},
            {value: "ecmascript", text: "ECMAScript"},
            {value: "eiffel", text: "Eiffel"},
            {value: "email", text: "Email"},
            {value: "epc", text: "EPC"},
            {value: "erlang", text: "Erlang"},
            {value: "fsharp", text: "F#"},
            {value: "falcon", text: "Falcon"},
            {value: "fo", text: "FO Language"},
            {value: "f1", text: "Formula One"},
            {value: "fortran", text: "Fortran"},
            {value: "freebasic", text: "FreeBasic"},
            {value: "freeswitch", text: "FreeSWITCH"},
            {value: "gambas", text: "GAMBAS"},
            {value: "gml", text: "Game Maker"},
            {value: "gdb", text: "GDB"},
            {value: "genero", text: "Genero"},
            {value: "genie", text: "Genie"},
            {value: "gettext", text: "GetText"},
            {value: "go", text: "Go"},
            {value: "groovy", text: "Groovy"},
            {value: "gwbasic", text: "GwBasic"},
            {value: "haskell", text: "Haskell"},
            {value: "haxe", text: "Haxe"},
            {value: "hicest", text: "HicEst"},
            {value: "hq9plus", text: "HQ9 Plus"},
            {value: "html4strict", text: "HTML"},
            {value: "html5", text: "HTML 5"},
            {value: "icon", text: "Icon"},
            {value: "idl", text: "IDL"},
            {value: "ini", text: "INI file"},
            {value: "inno", text: "Inno Script"},
            {value: "intercal", text: "INTERCAL"},
            {value: "io", text: "IO"},
            {value: "j", text: "J"},
            {value: "java", text: "Java"},
            {value: "java5", text: "Java 5"},
            {value: "javascript", text: "JavaScript"},
            {value: "jquery", text: "jQuery"},
            {value: "kixtart", text: "KiXtart"},
            {value: "latex", text: "Latex"},
            {value: "ldif", text: "LDIF"},
            {value: "lb", text: "Liberty BASIC"},
            {value: "lsl2", text: "Linden Scripting"},
            {value: "lisp", text: "Lisp"},
            {value: "llvm", text: "LLVM"},
            {value: "locobasic", text: "Loco Basic"},
            {value: "logtalk", text: "Logtalk"},
            {value: "lolcode", text: "LOL Code"},
            {value: "lotusformulas", text: "Lotus Formulas"},
            {value: "lotusscript", text: "Lotus Script"},
            {value: "lscript", text: "LScript"},
            {value: "lua", text: "Lua"},
            {value: "m68k", text: "M68000 Assembler"},
            {value: "magiksf", text: "MagikSF"},
            {value: "make", text: "Make"},
            {value: "mapbasic", text: "MapBasic"},
            {value: "matlab", text: "MatLab"},
            {value: "mirc", text: "mIRC"},
            {value: "mmix", text: "MIX Assembler"},
            {value: "modula2", text: "Modula 2"},
            {value: "modula3", text: "Modula 3"},
            {value: "68000devpac", text: "Motorola 68000 HiSoft Dev"},
            {value: "mpasm", text: "MPASM"},
            {value: "mxml", text: "MXML"},
            {value: "mysql", text: "MySQL"},
            {value: "nagios", text: "Nagios"},
            {value: "newlisp", text: "newLISP"},
            {value: "text", text: "None"},
            {value: "nsis", text: "NullSoft Installer"},
            {value: "oberon2", text: "Oberon 2"},
            {value: "objeck", text: "Objeck Programming Langua"},
            {value: "objc", text: "Objective C"},
            {value: "ocaml-brief", text: "OCalm Brief"},
            {value: "ocaml", text: "OCaml"},
            {value: "octave", text: "Octave"},
            {value: "pf", text: "OpenBSD PACKET FILTER"},
            {value: "glsl", text: "OpenGL Shading"},
            {value: "oobas", text: "Openoffice BASIC"},
            {value: "oracle11", text: "Oracle 11"},
            {value: "oracle8", text: "Oracle 8"},
            {value: "oz", text: "Oz"},
            {value: "parasail", text: "ParaSail"},
            {value: "parigp", text: "PARI/GP"},
            {value: "pascal", text: "Pascal"},
            {value: "pawn", text: "PAWN"},
            {value: "pcre", text: "PCRE"},
            {value: "per", text: "Per"},
            {value: "perl", text: "Perl"},
            {value: "perl6", text: "Perl 6"},
            {value: "php", text: "PHP", selected: true},
            {value: "php-brief", text: "PHP Brief"},
            {value: "pic16", text: "Pic 16"},
            {value: "pike", text: "Pike"},
            {value: "pixelbender", text: "Pixel Bender"},
            {value: "plsql", text: "PL/SQL"},
            {value: "postgresql", text: "PostgreSQL"},
            {value: "povray", text: "POV-Ray"},
            {value: "powershell", text: "Power Shell"},
            {value: "powerbuilder", text: "PowerBuilder"},
            {value: "proftpd", text: "ProFTPd"},
            {value: "progress", text: "Progress"},
            {value: "prolog", text: "Prolog"},
            {value: "properties", text: "Properties"},
            {value: "providex", text: "ProvideX"},
            {value: "purebasic", text: "PureBasic"},
            {value: "pycon", text: "PyCon"},
            {value: "python", text: "Python"},
            {value: "pys60", text: "Python for S60"},
            {value: "q", text: "q/kdb+"},
            {value: "qbasic", text: "QBasic"},
            {value: "rsplus", text: "R"},
            {value: "rails", text: "Rails"},
            {value: "rebol", text: "REBOL"},
            {value: "reg", text: "REG"},
            {value: "rexx", text: "Rexx"},
            {value: "robots", text: "Robots"},
            {value: "rpmspec", text: "RPM Spec"},
            {value: "ruby", text: "Ruby"},
            {value: "gnuplot", text: "Ruby Gnuplot"},
            {value: "sas", text: "SAS"},
            {value: "scala", text: "Scala"},
            {value: "scheme", text: "Scheme"},
            {value: "scilab", text: "Scilab"},
            {value: "sdlbasic", text: "SdlBasic"},
            {value: "smalltalk", text: "Smalltalk"},
            {value: "smarty", text: "Smarty"},
            {value: "spark", text: "SPARK"},
            {value: "sparql", text: "SPARQL"},
            {value: "sql", text: "SQL"},
            {value: "stonescript", text: "StoneScript"},
            {value: "systemverilog", text: "SystemVerilog"},
            {value: "tsql", text: "T-SQL"},
            {value: "tcl", text: "TCL"},
            {value: "teraterm", text: "Tera Term"},
            {value: "thinbasic", text: "thinBasic"},
            {value: "typoscript", text: "TypoScript"},
            {value: "unicon", text: "Unicon"},
            {value: "uscript", text: "UnrealScript"},
            {value: "ups", text: "UPC"},
            {value: "urbi", text: "Urbi"},
            {value: "vala", text: "Vala"},
            {value: "vbnet", text: "VB.NET"},
            {value: "vedit", text: "Vedit"},
            {value: "verilog", text: "VeriLog"},
            {value: "vhdl", text: "VHDL"},
            {value: "vim", text: "VIM"},
            {value: "visualprolog", text: "Visual Pro Log"},
            {value: "vb", text: "VisualBasic"},
            {value: "visualfoxpro", text: "VisualFoxPro"},
            {value: "whitespace", text: "WhiteSpace"},
            {value: "whois", text: "WHOIS"},
            {value: "winbatch", text: "Winbatch"},
            {value: "xbasic", text: "XBasic"},
            {value: "xml", text: "XML"},
            {value: "xorg_conf", text: "Xorg Config"},
            {value: "xpp", text: "XPP"},
            {value: "yaml", text: "YAML"},
            {value: "z80", text: "Z80 Assembler"},
            {value: "zxbasic", text: "ZXBasic"}
        ],
        timeFrames: [
            {value: "N", text: "Never"},
            {value: "10M", text: "10 Minutes"},
            {value: "1H", text: "1 Hour"},
            {value: "1D", text: "1 Day", selected: true},
            {value: "1W", text: "1 Week"},
            {value: "2W", text: "2 Weeks"},
            {value: "1M", text: "1 Month"}
        ]
    },
    time = {
        intervalHandle: 0,
        updateTimestamp: function () {
            var timestamp = new Date().getTime();
            if (document.activeElement.id !== "timestamp") {
                updateOutput("timestamp", (timestamp / 1000 | 0).toString());
            }
            if (!this.intervalHandle) {
                time.intervalHandle = setInterval(this.updateTimestamp, 1000);
            }
        },
        pauseTimestamp: function () {
            if (this.intervalHandle) {
                clearInterval(this.intervalHandle);
                this.intervalHandle = 0;
            }
        },
        getNiceTimestampConversion: function (input) {
            var epoch,
                result,
                timestampType;
            if (input.charAt(input.length - 1) == "L") {
                input = input.slice(0, -1);
            }
            input *= 1;
            epoch = input;

            //determine timestampType
            timestampType = document.getElementById("timestampType").value;
            switch (timestampType) {
                case "A":
                    if (epoch >= 100000000000) {
                        epoch = (epoch / 1e3 | 0);
                    }
                    if (epoch >= 100000000000) {
                        epoch = (epoch / 1e3 | 0);
                    }
                    break;
                case "MILLI":
                    epoch = (epoch / 1e3 | 0);
                    break;
                case "MICRO":
                    epoch = (epoch / 1e6 | 0);
                    break;
                case "SEC":
                default:
                    //do nothing
                    break;
            }
            result = this.getHumanFormatForSeconds(epoch);
            //add MongoId
            result += "\nObjectId(\"" + epoch.toString(16) + "0000000000000000\")";
            return result;
        },
        getHumanFormatForSeconds: function (input) {
            var date = new Date(input * 1000),
                localTime,
                gmtTime,
                result = input + "\n";
            if (Object.prototype.toString.call(date) !== "[object Date]" || date.toString() === "Invalid Date") {
                result = "Cannot parse date";
            } else {
                localTime = date.getFullYear() + "-" +
                ("0" + (date.getMonth() + 1)).slice(-2) + "-" +
                ("0" + date.getDate()).slice(-2) + " " +
                ("0" + date.getHours()).slice(-2) + ":" +
                ("0" + date.getMinutes()).slice(-2) + ":" +
                ("0" + date.getSeconds()).slice(-2) + " GMT" + ((-date.getTimezoneOffset() > 0) ? "+" : "-") + (-date.getTimezoneOffset() / 60).toString();
                gmtTime = date.getUTCFullYear() + "-" +
                ("0" + (date.getUTCMonth() + 1)).slice(-2) + "-" +
                ("0" + date.getUTCDate()).slice(-2) + " " +
                ("0" + date.getUTCHours()).slice(-2) + ":" +
                ("0" + date.getUTCMinutes()).slice(-2) + ":" +
                ("0" + date.getUTCSeconds()).slice(-2) + " GMT";

                result += gmtTime;
                if (date.getTimezoneOffset() !== 0) {
                    result += "\n" + localTime;
                }
            }
            return result;
        },
        updateDate: function () {
            var date = new Date();
            updateOutput("date-yyyy", date.getUTCFullYear());
            updateOutput("date-mm", ("0" + date.getUTCMonth()).slice(-2));
            updateOutput("date-dd", ("0" + date.getUTCDate()).slice(-2));
            updateOutput("date-hh", ("0" + date.getUTCHours()).slice(-2));
            updateOutput("date-ii", ("0" + date.getUTCMinutes()).slice(-2));
            updateOutput("date-ss", ("0" + date.getUTCSeconds()).slice(-2));
        },
        convertHumanToEpoch: function () {
            var tz = document.getElementById("date-tz").value,
                d,
                yyyy = document.getElementById("date-yyyy").value,
                mm = document.getElementById("date-mm").value,
                dd = document.getElementById("date-dd").value,
                hh = document.getElementById("date-hh").value,
                ii = document.getElementById("date-ii").value,
                ss = document.getElementById("date-ss").value,
                epoch;
            if (tz == 2) {
                d = new Date(yyyy, mm - 1, dd, hh, ii, ss);
            } else {
                d = new Date(Date.UTC(yyyy, mm - 1, dd, hh, ii, ss));
            }
            epoch = (d.getTime() / 1000);
            updateOutput("timestampResult", epoch)
        }
    },
    updateOutput = function (id, result) {
        if (document.getElementById(id).value !== undefined) {
            document.getElementById(id).value = result;
        }
        else {
            document.getElementById(id).innerHTML = result;
        }
    };
