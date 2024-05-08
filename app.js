const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const {body, validationResult, check} = require('express-validator');
const methodOverride = require('method-override');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');

require('./utils/db');
const Contact = require('./model/contact')

const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.use(expressLayouts);
app.use(express.static('public'));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));

app.use(cookieParser('secret'));
app.use(session({
    cookie: {maxAge: 6000},
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));
app.use(flash());

app.get('/', (req, res) => {
    const mahasiswa = [
        {
            nama: 'subjek1',
            no: '123'
        },
        {
            nama: 'subjek2',
            no: '12'
        }
    ]
    res.render('index', {
        layout: 'template/main-template',
        nama: 'rawr',
        tittle: 'Home',
        mahasiswa
    });
});

app.get('/about', (req, res) => {
    res.render('about', {
        layout: 'template/main-template',
        tittle: "About Page",
    });
});

app.get('/contact', async (req, res) => {
    const contacts = await Contact.find();
    res.render('contact', {
        layout: 'template/main-template',
        tittle: 'Contact Page',
        contacts,
        msg: req.flash('msg')
    });
});

app.get('/contact/add', (req, res) => {
    res.render('add', {
        layout: 'template/main-template',
        tittle: 'Form Add Contact',
    });
});
app.post('/contact', [
    body('nama').custom( async value => {
        const duplikat = await Contact.findOne({
            nama: value
        });
        if(duplikat){
            throw new Error('Nama Sudah Terdaftar!');
        }
        return true
    }),
    check('email', 'Tuliskan Email yang Benar!').isEmail(),
    check('nohp', 'Tuliskan Nomor HP yang Benar!').isMobilePhone('id-ID')
], async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        res.render('add', {
            tittle: 'Form Add Contact',
            layout: 'template/main-template',
            errors: errors.array()
        })
    } else {
        await Contact.insertMany(req.body);
        req.flash('msg', 'Contact Berhasil di Tambahkan!');
        res.redirect('/contact');
    }
});


app.delete('/contact', async (req, res) => {
    await Contact.deleteOne({
        nama: req.body.nama
    });
    req.flash('msg', 'Contact Berhasil di Hapus!')
    res.redirect('/contact');
});

app.get('/contact/edit/:nama', async (req, res) => {
    const contact = await Contact.findOne({
        nama: req.params.nama
    });
    res.render('edit', {
        layout: 'template/main-template',
        tittle: 'Form Edit Contact',
        contact
    });
});
app.put('/contact', [
    body('nama').custom( async (nama, {req}) => {
            const duplikat = await Contact.findOne({nama});
            if(nama !== req.body.namaOld && duplikat){
                throw new Error('Nama Sudah Terdaftar!')
            }
            return true
    }),
    check('email', 'Tuliskan Email yang Benar!').isEmail(),
    check('nohp', 'Tuliskan Nomor HP yang Benar!').isMobilePhone('id-ID')
], async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        res.render('edit', {
            tittle: 'Form Edit Contact',
            layout: 'template/main-template',
            errors: errors.array(),
            contact: req.body
        });
    } else {
        await Contact.updateOne(
            {_id: req.body._id},
        {
            $set: {
                nama: req.body.nama,
                nohp: req.body.nohp,
                email: req.body.email,
            }
        }
        );
        req.flash('msg', 'Contact Berhasil di Ubah!')
        res.redirect('/contact');
    }
});

app.get('/contact/:nama', async (req, res) => {
    const contact = await Contact.findOne({
        nama: req.params.nama
    });
    res.render('detail', {
        layout: 'template/main-template',
        tittle: 'Detail Page',
        contact
    });
});

app.listen(port, () => {
    console.log(`This app listening at http://localhost:${port}`);
})