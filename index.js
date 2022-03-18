require("dotenv").config()
const express = require("express");
const jwt = require("jsonwebtoken");
const {results} = require("./data/agentes")

const app = express();

// midleware 
app.use(express.static(__dirname + "/public"))
app.use(express.json())
app.use(express.urlencoded({extended : false}))


// 1. Crear una ruta que autentique a un agente basado en sus credenciales y genera un token con sus datos.
// 2. Al autenticar un agente, devolver un HTML que: 1.Muestre el email del agente autorizado. 2. Guarde un token en SessionStorage con un tiempo de expiración de 2 minutos. 3. Disponibiliza un hiperenlace para redirigir al agente a una ruta restringida.

app.post("/SignIn", (req,res) => {
    const {email,password} = req.body;

    const emailcheck = results.some((data) => {
        return data.email == email
    })
    const passwordcheck = results.some((data) => {
        return data.password == password
    })

    if(!emailcheck){
       return res.status(401).json({msg: "email no valido"})
    }
    if(!passwordcheck){
        return res.status(401).json({msg: "password no valido"})
    }
 
    const payload = {email};
    const token = jwt.sign(payload, process.env.JWT_SECRET , {expiresIn: "120s"})

    return res.send(`
    <h4>Agente ${email} autorizado, su token esta en el SessionStorage</h4>
    <script>
    sessionStorage.setItem('token', JSON.stringify("${token}"))
    </script>
    <a href="/Dashboard?token=${token}"> <p> Ir al Dashboard </p> </a>
    `)

})

//  Crear una ruta restringida que devuelva un mensaje de Bienvenida con el correo del
// agente autorizado, en caso contrario devolver un estado HTTP que indique que el
// usuario no está autorizado y un mensaje que menciona la descripción del error.

app.get("/Dashboard", (req,res) => {
    const {token} = req.query;

    if(!token){
        return res.status(403).json({msg:"no existe token"})
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET )
        return res.send(`Bienvenido/a usuario ${payload.email}`)
    } catch (error) {
        return res.send("Usuario no autorizado, error : " + error.message )
        
    }
})


app.listen(5000, console.log("servidor andando puerto 5000"))