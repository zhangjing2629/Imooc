module.exports = function(grunt){


	grunt.initConfig({
		watch:{
			jade:{
				files:['views/**'],
				options:{
					livereload:true//文件改动时重启服务
				}
			},
			js:{
				files:['public/js/**','models/**/*.js','schemas/**/*.js'],
				//tasks:['jshint'],
				options:{
					livereload:true
				}
			}
		},
		nodemon:{
			dev:{
				options:{
					files:'app.js',
					args:[],
					ignoredFiles:['README.md','node_modules/**','.DS_Store'],
					watchedExtensions:['js'],
					watchedFolders:['./'],
					debug:true,
					delayTime:1,
					env:{
						PORT:3000
					},
					cwd:__dirname
				}
			}
		},
		concurrent:{
			tasks:['nodemon','watch'],
			options:{
				logConcurrentOutput:true
			}
		}

	})

	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-nodemon');//监听入口文件，入口文件改变时重启服务
	grunt.loadNpmTasks('grunt-concurrent');//优化任务加载时间

	grunt.option('force',true)
	grunt.registerTask('default',['concurrent'])
}