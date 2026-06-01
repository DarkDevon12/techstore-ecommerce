// Importação do Firebase
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getFirestore, collection, getDocs } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import firebaseConfig from './firebase-config.js';

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Produtos de exemplo (fallback)
const produtosExemplo = [
    {
        id: 1,
        nome: "Fone de Ouvido Bluetooth",
        preco: 149.90,
        descricao: "Fone de ouvido sem fio com cancelamento de ruído, bateria de 30h e som de alta qualidade. Perfeito para música e chamadas.",
        imagem: "",
        detalhes: "- Bluetooth 5.0\n- Bateria: 30 horas\n- Cancelamento de ruído ativo\n- Microfone integrado\n- Dobrável e portátil"
    },
    {
        id: 2,
        nome: "Smartwatch Fitness",
        preco: 299.90,
        descricao: "Relógio inteligente com monitor cardíaco, GPS integrado, resistente à água e diversas modalidades esportivas.",
        imagem: "",
        detalhes: "- Monitor cardíaco 24/7\n- GPS integrado\n- Resistente à água (IP68)\n- 14 modalidades esportivas\n- Bateria de 7 dias"
    },
    {
        id: 3,
        nome: "Mouse Gamer RGB",
        preco: 89.90,
        descricao: "Mouse gamer com 7 botões programáveis, sensor óptico de alta precisão e iluminação RGB personalizável.",
        imagem: "",
        detalhes: "- Sensor óptico 16000 DPI\n- 7 botões programáveis\n- RGB personalizável\n- Ergonômico\n- Cabo trançado"
    },
    {
        id: 4,
        nome: "Teclado Mecânico",
        preco: 349.90,
        descricao: "Teclado mecânico com switches blue, iluminação RGB por tecla e estrutura em alumínio. Ideal para gamers e programadores.",
        imagem: "",
        detalhes: "- Switches mecânicos blue\n- RGB por tecla\n- Estrutura em alumínio\n- Anti-ghosting completo\n- Layout ABNT2"
    },
    {
        id: 5,
        nome: "Webcam Full HD",
        preco: 199.90,
        descricao: "Webcam 1080p com microfone embutido, foco automático e compatível com todas as plataformas de streaming.",
        imagem: "",
        detalhes: "- Resolução 1080p 60fps\n- Foco automático\n- Microfone estéreo\n- Plug and play\n- Compatível com OBS e Streamlabs"
    },
    {
        id: 6,
        nome: "Carregador Portátil 20000mAh",
        preco: 119.90,
        descricao: "Power bank de alta capacidade com saída rápida USB-C, carrega até 4 dispositivos simultaneamente.",
        imagem: "",
        detalhes: "- Capacidade: 20000mAh\n- Carregamento rápido\n- USB-C e USB-A\n- 4 dispositivos simultâneos\n- Display LED de bateria"
    }
];

// Função para carregar produto específico
async function carregarProduto(id) {
    try {
        const querySnapshot = await getDocs(collection(db, "produtos"));

        if (querySnapshot.empty) {
            return produtosExemplo.find(p => p.id == id);
        } else {
            let produtoEncontrado = null;
            querySnapshot.forEach((doc) => {
                const produto = { id: doc.id, ...doc.data() };
                if (produto.id == id) {
                    produtoEncontrado = produto;
                }
            });
            return produtoEncontrado;
        }
    } catch (error) {
        console.error("Erro ao carregar produto:", error);
        return produtosExemplo.find(p => p.id == id);
    }
}

// Função para exibir detalhes do produto
function exibirProduto(produto) {
    const container = document.getElementById('product-content');

    if (!produto) {
        container.innerHTML = '<p>Produto não encontrado.</p>';
        return;
    }

    container.innerHTML = `
        <div class="product-image-large-1">
    <img src="${produto.imagem}" alt="${produto.nome}"> </div>
        <div class="product-details">
            <h1>${produto.nome}</h1>
            <div class="price">R$ ${produto.preco.toFixed(2)}</div>
            <div class="description">
                <h3>Descrição</h3>
                <p>${produto.descricao}</p>
                ${produto.detalhes ? `<pre style="font-family: inherit; white-space: pre-wrap;">${produto.detalhes}</pre>` : ''}
            </div>
            
            <div class="quantity-selector">
                <label>Quantidade:</label>
                <button onclick="diminuirQuantidade()">-</button>
                <input type="number" id="quantity" value="1" min="1" max="10" readonly>
                <button onclick="aumentarQuantidade()">+</button>
            </div>
            
            <button class="btn btn-large" onclick="adicionarAoCarrinhoDetalhes()">
                Adicionar ao Carrinho
            </button>
            
            <a href="index.html" class="btn btn-secondary" style="margin-top: 1rem; text-align: center;">
                Voltar para a loja
            </a>
        </div>
    `;
}

// Funções para controlar quantidade
window.aumentarQuantidade = function () {
    const input = document.getElementById('quantity');
    if (input.value < 10) {
        input.value = parseInt(input.value) + 1;
    }
}

window.diminuirQuantidade = function () {
    const input = document.getElementById('quantity');
    if (input.value > 1) {
        input.value = parseInt(input.value) - 1;
    }
}

// Função para adicionar ao carrinho da página de detalhes
window.adicionarAoCarrinhoDetalhes = function () {
    const urlParams = new URLSearchParams(window.location.search);
    const id = parseInt(urlParams.get('id'));
    const quantidade = parseInt(document.getElementById('quantity').value);

    carregarProduto(id).then(produto => {
        if (!produto) return;

        let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
        const itemExistente = carrinho.find(item => item.id === id);

        if (itemExistente) {
            itemExistente.quantidade += quantidade;
        } else {
            carrinho.push({
                id: produto.id,
                nome: produto.nome,
                preco: produto.preco,
                imagem: produto.imagem,
                quantidade: quantidade
            });
        }

        localStorage.setItem('carrinho', JSON.stringify(carrinho));
        atualizarContadorCarrinho();

        alert(`${quantidade}x ${produto.nome} adicionado(s) ao carrinho!`);
    });
}

// Atualizar contador do carrinho
function atualizarContadorCarrinho() {
    const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    const total = carrinho.reduce((sum, item) => sum + item.quantidade, 0);
    document.getElementById('cart-count').textContent = total;
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    if (id) {
        carregarProduto(parseInt(id)).then(produto => {
            exibirProduto(produto);
        });
    } else {
        document.getElementById('product-content').innerHTML = '<p>Produto não especificado.</p>';
    }

    atualizarContadorCarrinho();
});