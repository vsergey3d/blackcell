
module.exports = function(grunt) {

    var _ = require("lodash"),

        config = {
            bjs: "blackcell.js",
            libFileName: "b",
            srcDir: "src",
            srcFiles: [],
            testDir: "test",
            testFiles: [],
            buildDir: "build",
            outDir: "out",
            coverageDir: "<%= conf.outDir %>/coverage",
            apiDir: "<%= conf.outDir %>/api"
        },

        deps = grunt.file.readJSON(config.buildDir + "/deps.json"),
        modules = grunt.file.readJSON(config.buildDir + "/modules.json"),

        resolveDeps = function(modules, deps, resolved) {

            modules.forEach(function(moduleName) {

                if(deps.hasOwnProperty(moduleName)) {

                    var moduleDeps = deps[moduleName].deps;
                    if(moduleDeps.length !== 0){
                        resolveDeps(moduleDeps, deps, resolved);
                    }
                }

                if(resolved.indexOf(moduleName) === -1) {
                    resolved.push(moduleName);
                }
            });
        },

        parseModulesStr = function (str) {

            var fullModuleList = [],
                reqModules = (arguments.length === 0) ? _.keys(modules) : str.split("+");

            resolveDeps(reqModules, deps, fullModuleList);
            return fullModuleList;
        },

        buildFileList = function(moduleStrList) {

            var conf = grunt.config("conf"),

                srcDir = conf.srcDir,
                testDir = conf.testDir,

                bjs = srcDir + "/" + conf.bjs,
                list = { srcFiles: [ bjs ], testFiles: [] };

            moduleStrList.forEach(function(moduleName) {

                if(!modules.hasOwnProperty(moduleName)) {
                    throw new Error("Missing module description [" + moduleName +"]");
                }

                var data = modules[moduleName];
                if(data.hasOwnProperty("srcFiles")) {
                    data.srcFiles.forEach(function(fileName) {
                        list.srcFiles.push(srcDir + "/" + moduleName +  "/" + fileName);
                    });
                }
                if(data.hasOwnProperty("testFiles")) {
                    data.testFiles.forEach(function(fileName) {
                        list.testFiles.push(testDir + "/" + moduleName +  "/" + fileName);
                    });
                }
            });

            return list;
        },

        configure = function(moduleStrList){

            var files = buildFileList(moduleStrList);

            grunt.config("conf.srcFiles", files.srcFiles);
            grunt.config("conf.testFiles", files.testFiles);

            grunt.log.writeln("Modules: " + grunt.log.wordlist(moduleStrList, { color: "cyan" }));
            grunt.verbose.writeln("Src files: " + files.srcFiles);
            grunt.verbose.writeln("Test files: " + files.testFiles);
        },

        registerGruntTask = _.wrap(grunt.registerTask, function(registerTaskFunc) {

            var taskName = arguments[1],
                taskInfo = arguments[2],
                taskFunc = arguments[3];

            if(!_.isFunction(taskFunc) && !_.isArray(taskFunc)) {
                taskFunc = taskInfo;
                taskInfo = null;
            }

            registerTaskFunc(taskName, taskInfo, function() {

                if(!grunt.config("conf.configured")) {
                    configure(parseModulesStr.apply(this, arguments));
                    grunt.config("conf.configured", true);
                }
                if(_.isArray(taskFunc)) {
                    grunt.task.run(taskFunc);
                }
                else if(_.isFunction(taskFunc)) {
                    taskFunc.apply(this, arguments);
                }
                else {
                    grunt.fail.warn("no func");
                }
            });
        });

    grunt.initConfig({

        pkg: grunt.file.readJSON("package.json"),
        conf: config,

        clean: {
            min: ["<%= concat.dist.dest %>", "<%= uglify.dist.dest %>",
                "<%= uglify.options.sourceMap %>"],
            beforeTest: ["<%= conf.coverageDir %>"],
            afterTest: ["<%= karma.configFile %>"],
            beforeDoc: ["<%= conf.apiDir %>"]
        },

        jshint: {
            gruntfile:  {
                options: {
                    jshintrc: ".jshintrc"
                },
                files: {
                    src: ["gruntfile.js"]
                }
            },
            src: {
                options: {
                    jshintrc: "<%= conf.srcDir %>/.jshintrc"
                },
                files: {
                    src: ["<%= conf.srcFiles %>"]
                }
            },
            test: {
                options: {
                    jshintrc: "<%= conf.testDir %>/.jshintrc"
                },
                files: {
                    src: ["test/prepare.js","<%= conf.testFiles %>"]
                }
            }
        },

        jsdoc : {
            src: ["<%= conf.srcFiles %>"],
            options: {
                configure: "<%= conf.buildDir %>/jsdoc.json",
                destination: "<%= conf.apiDir %>",
                template: "<%= conf.buildDir %>/jsdoc"
            }
        },

        karma: {
            tmplFile: "<%= conf.buildDir %>/karma.tmpl",
            configFile: "<%= conf.buildDir %>/karma.conf.js"
        },

        karmaConf: {
            options: {
                configFile: "<%= karma.configFile %>"
            },
            continuous: {
                singleRun: true
            },
            debug: {
                singleRun: false,
                logLevel: "LOG_DEBUG",
                reporters: "dots"
            },
            server: {
                background: true,
                reporters: "dots"
            },
            travis: {
                singleRun: true,
                browsers: ['PhantomJS']
            }
        },

        watch: {
            karma: {
                files: ["<%= conf.srcFiles %>", "test/prepare.js", "<%= conf.testFiles %>"],
                tasks: ["lint", "karma:server:run"]
            }
        },

        concat: {
            dist: {
                src:  ["<%= conf.srcFiles %>"],
                dest: "<%= conf.outDir %>/<%= conf.libFileName %>.js"
            }
        },

        uglify: {
            options: {
                report: "min",
                sourceMap: "<%= conf.libFileName %>.js.map"
            },
            dist: {
                src:  ["<%= conf.libFileName %>.js"],
                dest: "<%= conf.libFileName %>.min.js"
            }
        }
    });

    require("matchdep").filterDev("grunt-*").forEach(grunt.loadNpmTasks);

    grunt.renameTask("karma", "karmaConf");
    grunt.registerTask("karma", "configures karma", function() {

        var karmaOpts = grunt.config("karma"),
            tmplFile = grunt.template.process(karmaOpts.tmplFile),
            configFile = grunt.template.process(karmaOpts.configFile),

            confOpts = grunt.config("conf");

        if (!grunt.file.exists(tmplFile)) {
            grunt.fail.warn("Karma template [" + tmplFile + "] not found.");
        }

        grunt.file.copy(tmplFile, configFile,
            {
                process: function(content) {
                    return grunt.template.process(content, { data: confOpts });
                }
            }
        );

        var karmaArgs = this.nameArgs.replace("karma", "karmaConf");
        if(this.args.length === 0) {
            karmaArgs += ":continuous";
        }

        grunt.task.run(karmaArgs);
    });

    grunt.registerTask("uglify-conf",function() {

        var oldCWD = process.cwd(),
            dir = grunt.config("conf.outDir");

        grunt.registerTask("before", function() {
            grunt.file.setBase(dir);
            grunt.verbose.writeln("Change cwd to: " + dir);
        });

        grunt.registerTask("after", function() {
            grunt.file.setBase(oldCWD);
            grunt.verbose.writeln("Change cwd to: " + oldCWD);
        });

        grunt.task.run("before", "uglify", "after");
    });

    registerGruntTask("bg", ["karma:server", "watch"]);
    registerGruntTask("travis", ["karma:travis"]);

    registerGruntTask("lint", ["jshint"]);
    registerGruntTask("min", ["clean:min", "concat", "uglify-conf"]);
    registerGruntTask("test", ["clean:beforeTest", "karma", "clean:afterTest"]);
    registerGruntTask("doc", ["clean:beforeDoc", "jsdoc"]);

    registerGruntTask("dev", ["lint", "min"]);
    registerGruntTask("default", ["lint", "test", "min", "doc"]);
};