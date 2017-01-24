// 现在它说bodyParser已经不支持了,于是我又安装了bodyParser模块,然后这样写:
// var express = require('express');
// var bodyParser = require('body-parser');
// var app = express();
// app.use(bodyParser());



var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var connect = require('connect');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);


var mongoose = require("mongoose");
var Movie = require('./models/movie');
var User = require('./models/user');

var _ = require('underscore'); //替换对象模块
var port = process.env.PORT || 3000; //process.env.PORT环境变量，可以通过在命令行 PORT=4000 node app.js改变端口
var app = express(); //启动web服务器；
mongoose.Promise = global.Promise
var dbUrl = "mongodb://127.0.0.1/Imooc"
mongoose.connect(dbUrl)

app.set('views', './views/pages'); //设置视图的根目录
app.set('view engine', 'jade'); //设置模版引擎
app.use(bodyParser()) //格式化表单数据
app.use(express.static(path.join(__dirname, 'public'))); //设置静态资源路径
app.locals.moment = require('moment')

app.use(cookieParser())
app.use(session({
    secret:"Imooc",
    store: new MongoStore({
        url:dbUrl,
        collection:"sessions"
    })
})) //格式化表单数据

app.listen(port);
console.log("Imooc started on port " + port);



//router
app.get('/', function(req, res) {
    console.log(req.session.user)
    Movie.fetch(function(err, movies) {
        if (err) {
            console.log(err)
        }
        res.render('index', {
            title: 'imooc 　首页',
            movies: movies
        })
    })

})

//signup
app.post('/user/signup', function(req, res) {
    var _user = req.body.user;
    User.find({ name: _user.name }, function(err, user) {
        if (err) {
            console.log(err)
        }
        if (user.length) {
            return res.redirect('/')
        } else {
            var user = new User(_user);
            user.save(function(err, user) {
                if (err) {
                }
                res.redirect('/admin/userlist')
            })
            
        }
    })
})

//signup
app.post('/user/signin', function(req, res) {
    var _user = req.body.user;
    var name = _user.name;
    var password = _user.password;
    User.findOne({ name: _user.name}, function(err, user) {
        if (err) {
            console.log(err)
        }
        if (!user) {//用户不存在
            return res.redirect('/')
        } else {
           user.comparePassword(password,function(err,isMatch){
                if(err){
                    console.log(err)
                }
                if(isMatch){
                    req.session.user = user;

                    return res.redirect('/')
                }else{
                    console.log("password is not matched")
                }
           })
        }
    })
})


app.get('/admin/userlist', function(req, res) {
    User.fetch(function(err, users) {
        if (err) {
            console.log(err)
        }
        res.render('userlist', {
            // title: 'imooc userlist',
            users: users
        })
    })
})


app.get('/movie/:id', function(req, res) {
    var id = req.params.id;
    Movie.findById(id, function(err, movie) {
        res.render('detail', {
            // title: 'imooc' + movie.title,
            movie: movie
        })
    })

})



app.get('/admin/movie', function(req, res) {
    res.render('admin', {
        title: 'imooc 后台录入页',
        movie: {
            title: "",
            doctor: "",
            country: "",
            year: "",
            poster: "",
            falsh: "",
            summary: "",
            language: "",
            flash: ""
        }
    })
})

//从后台录入页提交的
app.post('/admin/movie/new', function(req, res) {
    var id = req.body.movie._id;
    var movieObj = req.body.movie;
    var _movie;
    if (id != 'undefined') { //已经存在的，进行更新
        Movie.findById(id, function(err, movie) {
            if (err) {
                console.log(err)
            }
            _movie = _.extend(movie, movieObj);
            _movie.save(function(err, movie) {
                if (err) {
                    console.log(err)
                }
                res.redirect('/movie/' + movie._id)
            })
        })
    } else {
        _movie = new Movie({
            doctor: movieObj.doctor,
            title: movieObj.title,
            country: movieObj.country,
            summary: movieObj.summary,
            poster: movieObj.poster,
            year: movieObj.year,
            flash: movieObj.flash,
            language: movieObj.language
        })
        _movie.save(function(err, movie) {
            if (err) {
                console.log(err)
            }
            res.redirect('/movie/' + movie._id)
        })
    }
})


app.get('/admin/list', function(req, res) {
    Movie.fetch(function(err, movies) {
        if (err) {
            console.log(err)
        }
        res.render('list', {
            title: 'imooc 列表页',
            movies: movies
        })
    })
})

//列表页修改
app.get('/admin/update/:id', function(req, res) {
    var id = req.params.id;
    if (id) {
        Movie.findById(id, function(err, movie) {
            res.render('admin', {
                title: 'imooc 后台更新页',
                movie: movie
            })
        })
    }
})

//列表页删除
app.delete('/admin/list', function(req, res) {
    var id = req.query.id;
    if (id) {
        Movie.remove({ _id: id }, function(err, movie) {
            if (err) {
                console.log(err)
            } else {
                res.json({ success: 1 })
            }
        })
    }
})