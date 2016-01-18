path = require('path')
gulp = require('gulp')
coffee = require('gulp-coffee')

OPTIONS =
	files:
		app: [ 'lib/**/*.coffee' ]
	directories:
		build: 'build/'

gulp.task 'coffee', ->
	gulp.src(OPTIONS.files.app)
		.pipe(coffee())
		.pipe(gulp.dest(OPTIONS.directories.build))

gulp.task 'build', [
	'coffee'
]
