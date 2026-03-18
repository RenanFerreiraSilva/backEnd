import express from 'express';
import cors from 'cors';
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from 'uuid';

const app = express();
app.use(express.json())
app.use(cors());
const port = process.env.PORT || 7770;

const users = [
    { id: uuidv4(), name: "Alice", available: true },
    { id: uuidv4(), name: "Bob", available: false },
    { id: uuidv4(), name: "Carol", available: true },
    { id: uuidv4(), name: "Paulo", available: false },
];


app.get('/users', (request, response) => {
    if (users.length === 0) {
        return response.status(404).json({ message: 'Nenhum usuario encontrado' });
    }

    response.json(users)
});

app.post('/users', (request, response) => {
    // const name = request.body.name;
    const { name, available } = request.body;

    if (!name) {
        return response.status(400).json({ message: "Nome de usuario é obrigatorio" });
    }

    const newUser = {
        id: uuidv4(),
        name,
        available: available ?? true
    };

    users.push(newUser);

    response.status(201).json({ message: `Usuário criando com sucesso`, user: newUser });
});
app.put('/users/:id', (request, response) => {
    const { id } = request.params;

    const { name, available } = request.body;

    const usuarioEncontrado = users.find(user => user.id === id);

    if (!usuarioEncontrado) {
        return response.status(404).json({ message: "Usuario nao encontrado" });
    };

    usuarioEncontrado.name = name;
    usuarioEncontrado.available = available;

    response.json({ message: "Usuario atualizado com sucesso", user: usuarioEncontrado });
});

app.get('/users/filtered', (request, response) => {
    const { filter } = request.query;

    let filteredUsers = users;

    if (filter === 'ativo') {
        filteredUsers = filteredUsers.filter(user => user.available === true);
    } else if (filter === 'inativo') {
        filteredUsers = filteredUsers.filter(user => user.available === false);
    };

    response.status(200).json(filteredUsers);
});

app.get('/', (request, response) => {
    response.send('Welcome to the Express!');
});


const viagens = [
    { id: uuidv4(), nome: "Italia", preco: "R$ 12.000", qtdPromo: 4 },
    { id: uuidv4(), nome: "Franca", preco: "R$ 14.000", qtdPromo: 6 },
    { id: uuidv4(), nome: "China", preco: "R$ 32.000", qtdPromo: 3 },
    { id: uuidv4(), nome: "Espanha", preco: "R$ 19.000", qtdPromo: 2 }
];

app.put('/endereco/:id', (request, response) => {
    const { id } = request.params;
    const { nome, preco } = request.body;

    const idEncontrado = viagens.find(viagem => viagem.id === id);

    if (!idEncontrado) {
        return response.status(404).json({ message: 'Viagem nao encontrada' });
    }

    idEncontrado.nome = nome;
    idEncontrado.preco = preco;

    response.status(200).json({ message: 'Recurso atualizado com sucesso!', viagem: idEncontrado });
})

app.post('/endereco', (request, response) => {
    const { nome, preco, qtdPromo } = request.body;

    if (!nome || !preco || !qtdPromo) {
        return response.status(404).json({ message: "Seu cadastro nao foi concluido com sucesso, obrigatorio nome da viagem, preco e quantidade de promocoes" });
    };

    const novaViagem = {
        id: uuidv4(),
        nome,
        preco,
        qtdPromo
    };

    viagens.push(novaViagem);

    response.status(201).json({
        message: `${novaViagem.nome}, criado com sucesso!  Seu indentificador é: ${novaViagem.id}, seu preço é: ${novaViagem.preco}
        e temos ${novaViagem.qtdPromo} em promoção.`
    });
});

app.get('/viagens', (request, response) => {

    if (viagens.length === 0) {
        return response.status(404).json({ message: 'Nenhuma viagem encontrada!' });
    }

    response.status(200).json({ message: "Essas sao as nossas viagens disponiveis:", viagem: viagens });
});

app.get('/endereco/:nome', (request, response) => {
    const { nome } = request.params;

    const viagemEncontrada = viagens.find(viagem => viagem.nome === nome);

    if (!viagemEncontrada) {
        return response.status(404).json({ message: "Viagem não encontrada" });
    }

    response.json({ message: "Recurso lido é:", viagem: viagemEncontrada });

});

app.delete('/viagens/:id', (request, response) => {
    const { id } = request.params;

    const viagemIndex = viagens.findIndex(viagem => viagem.id === id);

    if (!viagemIndex) {
        return response.status(404).json({ message: "Viagem nao encontrada" });
    };

    const deleteViagem = viagens.splice(viagemIndex, 1);

    response.status(200).json({ message: "Viagem removida com sucesso!", viagem: deleteViagem });
});




const adminUsers = []

app.post('/signup', async (request, response) => {
    try {
        const { email, password } = request.body;

        const hashPassword = await bcrypt.hash(password, 5);

        const existinUser = adminUsers.find(user => user.email === email);

        if (existinUser) {
            return response.status(400).json({ message: "Usuário já cadastrado!" });
        }

        const newUser = {
            id: uuidv4(),
            email,
            password: hashPassword
        }

        adminUsers.push(newUser);

        response.status(201).json({ message: "Usuario cadastrado com sucesso", user: newUser });

    } catch {
        response.status(500).json({ message: "Erro ao cadastrar usuario" })
    }
});

app.get('/admins', (request, response) => {
    if (adminUsers.lengt === 0) {
        return response.status(404).json({ message: "Nenhum usuario cadastrado" });
    };

    response.status(200).json({ message: "Este sao os administradores do grupo", admin: adminUsers });
});


app.post('/login', async (request, response) => {
    try {
        const { email, password } = request.body;   

        const user = adminUsers.find(user => user.email === email);

        if (!user) {
            return response.status(404).json({ message: "Email nao cadastrado!" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return response.status(404).json({ message: "Senha incorreta" });
        }

        response.status(200).json({ message: "Login de administrador efetuado com sucesso" });

    } catch {
        response.status(500).json({ message: "Erro ao fazer login" });
    }

});

app.listen(port, () => {
    console.log(`Sistema rodando na porta ${port}`);
});