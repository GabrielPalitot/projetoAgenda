const mongoose = require('mongoose');
const validator = require('validator');
const bcryptjs = require('bcryptjs');


const LoginSchema = new mongoose.Schema({
    email: {type: String, required: true},
    password: {type: String, required: true},

});

const LoginModel = mongoose.model('Login', LoginSchema);

class Login{
    constructor(body){
        this.body = body;
        this.errors = [];  // controla se o usuário pode ou não criar, registra os erros.
        this.user = null;
    }
    async register(){
        // Responsável por registrar o usuário

        // Limpa o usuário
        this.valida();
        if(this.errors.length > 0) return;

        // Checa no Banco se ele já existe
        await this.userExists();
        if(this.errors.length > 0) return;


        // fazendo hash da senha
        const salt = bcryptjs.genSaltSync();
        this.body.password = bcryptjs.hashSync(this.body.password,salt);
        // Banco de Dados
        this.user = await LoginModel.create(this.body);
    }

    async login(){
        this.valida();
        if(this.errors.length > 0) return;
        this.user = await LoginModel.findOne({email: this.body.email});

        if(!this.user){
            this.errors.push('Usuário não existe.');
            return;
        }

        if(!bcryptjs.compareSync(this.body.password, this.user.password)){
            this.errors.push('Senha Inválida');
            this.user = null;
            return;
        }

    }
    
    
    
    
    async userExists(){
        this.user = await LoginModel.findOne({email: this.body.email});
        if(this.user) this.errors.push('Usuário Já existe.');
    }

    valida(){
        this.cleanUp();
        // O email precisa ser válido
        if(!validator.isEmail(this.body.email)) this.errors.push('Email Invalido');
        // a senha precisa ter entre 5 e 50 caracteres
        if(this.body.password.length < 5 || this.body.password.length >= 50){
            this.errors.push('Tamanho Inválido de Senha');
        }
        

    }
    cleanUp(){
        for(const key in this.body){
           if(typeof this.body[key] !== 'string'){
                this.body[key] = '';     
           }
        }

        // Limpando objeto
        this.body = {
            email:this.body.email,
            password:this.body.password
        };
    }

}

module.exports = Login;