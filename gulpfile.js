const imageminMozjpeg 	= require('imagemin-mozjpeg');				// Сжатие .jpg .png .svg с потерей качества
const autoprefixer 		= require('gulp-autoprefixer');				// Автопрефиксы для старых браузеров
const browserSync 		= require('browser-sync').create();			// Синфхронизация index.html с браузером	
const sourcemaps 		= require('gulp-sourcemaps');
const cleanCSS 			= require('gulp-clean-css');				// Сжатие .css
const imagemin 			= require('gulp-imagemin');					// Сжатие .jpg
const pngquant 			= require('imagemin-pngquant');				// Сжатие .png
const preproc 			= require('gulp-less');						// Трансляция .less файлов в .css
const uglify			= require('gulp-uglifyjs');					// Сжатие js файлов
const rename 			= require('gulp-rename');					// Переименовывать файлы
const concat			= require('gulp-concat');					// Конкатинировать несколько файлов
const cache 			= require('gulp-cache');					// Добавление в кэш файлов
const gcmq 				= require('gulp-group-css-media-queries');
const gulp 				= require('gulp');
const del				= require('del');							// Удаление дерикторий - файлов

let config = {
	release: {
		current: 	'./release',
		styles: 	'/style',
		scripts: 	'/js',
		images: 	'/images'
	},
	src:		'./src',
	css: {
		watch: 		'/prestyle/**/*.less',
		src: 		'/prestyle/style.less',
		dest: 		'/style'
	},
	js: {
		src: 		'/prescript/**/*.js',
		dest: 		'/script',
		main: 		'/prescript/main.js'
	},
	html:		'/*.html',
	img: {
		src: 		'/preimages/**/*',
		dest: 		'/images/'
	}
}

gulp.task('styles', function(){
	gulp.src(config.src + config.css.src)
		.pipe(sourcemaps.init())
		.pipe(preproc())
		.pipe(gcmq())
		.pipe(autoprefixer({
            browsers: ['> 0.1%'],
            cascade: false
        }))
		.pipe(cleanCSS({
			level: 2
		}))
		.pipe(sourcemaps.write('.'))
		.pipe(rename({suffix: '.min'})) 
		.pipe(gulp.dest(config.src + config.css.dest))	
})
gulp.task('browserSync', function() {
    browserSync.init({
        server: {
            baseDir: config.src
        }
    });
});

gulp.task('scripts', function() {
	var libs = gulp.src(['!' + config.src + config.js.main, config.src + config.js.src])
		.pipe(concat('libs.min.js'))
		.pipe(uglify())
		.pipe(gulp.dest(config.src + config.js.dest))
	var main = gulp.src(config.src + config.js.main)
		.pipe(uglify())
		.pipe(rename({suffix: '.min'})) 
		.pipe(gulp.dest(config.src + config.js.dest))
});

gulp.task('img-compress', function(){
	gulp.src(config.src + config.img.src)
        .pipe(cache(imagemin({
			interlaced: true,
			progressive: true,
			svgoPlugins: [{removeViewBox: false}],
			use: [pngquant()]
		})))
        .pipe(gulp.dest(config.src + config.img.dest))
})

gulp.task('high-img-compress', function(){
	gulp.src(config.src + config.img.src)
        .pipe(imagemin([
			imageminMozjpeg({
                quality: 50
            })
		]))
        .pipe(gulp.dest(config.src + config.img.dest))
})
gulp.task('clear-cache', function (callback) {
	return cache.clearAll();
})
/////////////////////
gulp.task('watch', ['img-compress', 'browserSync'], function(){
	gulp.watch(config.src + config.css.watch, ['styles', browserSync.reload]);
	gulp.watch(config.src + config.js.src, ['scripts', browserSync.reload])
	gulp.watch(config.src + config.html, browserSync.reload);
	gulp.watch(config.src + config.img.src, ['img-compress']);
})
/////////////////////

gulp.task('build', ['styles', 'scripts', 'img-compress', 'del-release'],function(){
	var styles 	= gulp.src(config.src + config.css.dest + '/**/*')
					.pipe(gulp.dest(config.release.current + config.release.styles));
	var scripts = gulp.src(config.src + config.js.dest + '/**/*')
					.pipe(gulp.dest(config.release.current + config.release.scripts));
	var images 	= gulp.src(config.src + config.img.dest + '/**/*')
					.pipe(gulp.dest(config.release.current + config.release.images))
	var html 	= gulp.src(config.src + '/*.html')
					.pipe(gulp.dest(config.release.current))
})

gulp.task('del-release', function() {
	return del.sync(config.release.current);
});


gulp.task('default', ['watch']);