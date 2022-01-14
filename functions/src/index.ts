import * as functions from "firebase-functions";
import * as admin from 'firebase-admin';
import * as express from 'express';
import * as cors from 'cors';

const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

export const helloWorld = functions.https.onRequest((request, response) => {
  response.json({
      mensaje: "Hello from Firebase!"
    });
});

const db = admin.firestore()

export const getGoty = functions.https.onRequest(async (request, response) => {
    const gotyRef = db.collection('goty');
    const docSnap = await gotyRef.get();
    const juegos = docSnap.docs.map(doc => doc.data());
    response.json(juegos);
});

//Express
//poir si es necesario usar tokens y seguridad
const app = express();
app.use(cors(
    {
        origin:'*'
    }
    ));

app.get('/goty', async (req, res) => {
    const gotyRef = db.collection('goty');
    const docSnap = await gotyRef.get();
    const juegos = docSnap.docs.map(doc => doc.data());
    res.json(juegos);

})

app.post('/goty/:id', async (req, res) => {
    const id = req.params.id;
    console.info('hola')
    
    if(id){        
        const gameR = db.collection('goty').doc(id.toString());
        const gameSn = await gameR.get();
        if(gameSn.exists){
            const juego = gameSn.data() || {votos: 0};
            await gameR.update({
                votos: juego.votos +1
            });

            res.json({ok: true, mensaje: `Voto para ${juego.name}`});

        }
        else
            res.status(404).json({ok: false, mensaje: 'Id Incorrecto'});
    }
})


export const api = functions.https.onRequest(app);