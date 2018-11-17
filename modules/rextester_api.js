const querystring = require('querystring');
const https = require('https');
const logger = require('../logger');

var languages = {
    'ada': '39',
    'assembly': '15',
    'bash': '38',
    'brainfuck': '44',
    'c#': '1',
    'cpp_gcc': '7',
    'cpp_clang': '27',
    'cpp_vc++': '28',
    'c_gcc': '6',
    'c_clang': '26',
    'c_vc': '29',
    'clientside': '36',
    'commonlist': '18',
    'd': '30',
    'elixir': '41',
    'erlang': '40',
    'f#': '3',
    'fortan': '45',
    'go': '20',
    'haskell': '11',
    'java': '4',
    'javascript': '17',
    'kotlin': '43',
    'lua': '14',
    'mysql': '33',
    'nodejs': '23',
    'ocaml': '42',
    'octave': '25',
    'objectivec': '10',
    'oracle': '35',
    'pascal': '9',
    'perl': '13',
    'php': '8',
    'postgresql': '34',
    'prolog': '19',
    'python': '5',
    'python3': '24',
    'r': '31',
    'ruby': '12',
    'scala': '21',
    'scheme': '22',
    'sqlserver': '16',
    'swift': '37',
    'tcl': '32',
    'visualbasic': '2'
};

var compilerargs = {
    '7': '-Wall -std=c++14 -O2 -o a.out source_file.cpp',
    '27': '-Wall -std=c++14 -O2 -o a.out source_file.cpp',
    '28': 'source_file.cpp -o a.exe /EHsc /MD /I C:\\boost_1_60_0 /link /LIBPATH:C:\\boost_1_60_0\\stage\\lib',
    '6': '-Wall -std=gnu99 -O2 -o a.out source_file.c',
    '26': '-Wall -std=gnu99 -O2 -o a.out source_file.c',
    '29': 'source_file.c -o a.exe',
    '30': 'source_file.d -ofa.out',
    '20': '-o a.out source_file.go',
    '11': '-o a.out source_file.hs',
    '10': '-MMD -MP -DGNUSTEP -DGNUSTEP_BASE_LIBRARY=1 -DGNU_GUI_LIBRARY=1 -DGNU_RUNTIME=1 -DGNUSTEP_BASE_LIBRARY=1 -fno-strict-aliasing -fexceptions -fobjc-exceptions -D_NATIVE_OBJC_EXCEPTIONS -pthread -fPIC -Wall -DGSWARN -DGSDIAGNOSE -Wno-import -g -O2 -fgnu-runtime -fconstant-string-class=NSConstantString -I. -I /usr/include/GNUstep -I/usr/include/GNUstep -o a.out source_file.m -lobjc -lgnustep-base'
};

module.exports._mod_info = {
    name: 'rextester_api',
    description: 'Rextester API',
    author: 'Ryzerth',
};

module.exports._mod_init = (bot) => {
    logger.log(`Initializing rextester_api...`);

    logger.ok();
};

module.exports._mod_end = (bot) => {
    logger.log(`Stopping rextester_api...`);
    // TODO: Add shit idk
    logger.ok();
};

module.exports._getLanguages = function () {
    return languages;
};

module.exports._runCode = async (language, code) => {
    var langid = languages[language];

    var post_data = querystring.stringify({
        'LanguageChoiceWrapper': langid,
        'Program': code,
        'Input': '',
        'CompilerArgs': compilerargs[langid]
    });

    var post_options = {
        host: 'rextester.com',
        port: '443',
        path: '/rundotnet/api',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(post_data)
        }
    };
    var r = {
        data: post_data,
        options: post_options
    };

    return new Promise((res) => {
        let req = https.request(post_options, (result) => {
            let data = '';
            result.on('data', (chunck) => {
                data += chunck;
            });
            result.on('end', () => {
                res(JSON.parse(data));
            });
            result.on('error', (err) => {
                res(undefined);
            });
        });
        req.write(post_data);
        req.end();
    });
};