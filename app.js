// Importação do Firebase (usando CDN)
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getFirestore, collection, getDocs, addDoc } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import firebaseConfig from './firebase-config.js';

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Produtos de exemplo (caso o Firebase não esteja configurado ainda)
const produtosExemplo = [
    {
        id: 1,
        nome: "Fone de Ouvido Bluetooth",
        preco: 149.90,
        descricao: "Fone de ouvido sem fio com cancelamento de ruído, bateria de 30h e som de alta qualidade. Perfeito para música e chamadas.",
        imagem: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400"
    },
    {
        id: 2,
        nome: "Smartwatch Fitness",
        preco: 299.90,
        descricao: "Relógio inteligente com monitor cardíaco, GPS integrado, resistente à água e diversas modalidades esportivas.",
        imagem: ""
    },
    {
        id: 3,
        nome: "Mouse Gamer RGB",
        preco: 89.90,
        descricao: "Mouse gamer com 7 botões programáveis, sensor óptico de alta precisão e iluminação RGB personalizável.",
        imagem: ""
    },
    {
        id: 4,
        nome: "Teclado Mecânico",
        preco: 349.90,
        descricao: "Teclado mecânico com switches blue, iluminação RGB por tecla e estrutura em alumínio. Ideal para gamers e programadores.",
        imagem: ""
    },
    {
        id: 5,
        nome: "Webcam Full HD",
        preco: 199.90,
        descricao: "Webcam 1080p com microfone embutido, foco automático e compatível com todas as plataformas de streaming.",
        imagem: ""
    },
    {
        id: 6,
        nome: "Carregador Portátil 20000mAh",
        preco: 119.90,
        descricao: "Power bank de alta capacidade com saída rápida USB-C, carrega até 4 dispositivos simultaneamente.",
        imagem: ""
    }
];

// Função para carregar produtos do Firebase ou usar exemplos
async function carregarProdutos() {
    try {
        // Tentar carregar do Firebase
        const querySnapshot = await getDocs(collection(db, "produtos"));
        
        if (querySnapshot.empty) {
            // Se não houver produtos no Firebase, usar exemplos e adicionar ao Firebase
            console.log("Carregando produtos de exemplo...");
            await adicionarProdutosExemplo();
            return produtosExemplo;
        } else {
            // Carregar produtos do Firebase
            const produtos = [];
            querySnapshot.forEach((doc) => {
                produtos.push({ id: doc.id, ...doc.data() });
            });
            return produtos;
        }
    } catch (error) {
        console.error("Erro ao carregar produtos do Firebase:", error);
        console.log("Usando produtos de exemplo localmente");
        return produtosExemplo;
    }
}

// Função para adicionar produtos de exemplo ao Firebase
async function adicionarProdutosExemplo() {
    try {
        for (const produto of produtosExemplo) {
            await addDoc(collection(db, "produtos"), produto);
        }
        console.log("Produtos de exemplo adicionados ao Firebase!");
    } catch (error) {
        console.error("Erro ao adicionar produtos:", error);
    }
}

// Função para exibir produtos na página
function exibirProdutos(produtos) {
    const grid = document.getElementById('products-grid');
    grid.innerHTML = '';

    produtos.forEach(produto => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.onclick = () => verDetalhes(produto.id);

        card.innerHTML = `
            <div class="product-image-large">
    <img src="${produto.imagem}" alt="${produto.nome}">
</div>
            <div class="product-info">
                <h3>${produto.nome}</h3>
                <p>${produto.descricao.substring(0, 80)}...</p>
                <div class="product-price">R$ ${produto.preco.toFixed(2)}</div>
                <button class="btn" onclick="event.stopPropagation(); adicionarAoCarrinho(${produto.id}, '${produto.nome}', ${produto.preco}, '${produto.imagem}')">
                    Adicionar ao Carrinho
                </button>
            </div>
        `;

        grid.appendChild(card);
    });
}

// Função para ver detalhes do produto
function verDetalhes(id) {
    window.location.href = `produto.html?id=${id}`;
}

// Função para adicionar ao carrinho
window.adicionarAoCarrinho = function(id, nome, preco, imagem) {
    let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    
    const itemExistente = carrinho.find(item => item.id === id);
    
    if (itemExistente) {
        itemExistente.quantidade++;
    } else {
        carrinho.push({
            id: id,
            nome: nome,
            preco: preco,
            imagem: imagem,
            quantidade: 1
        });
    }
    
    localStorage.setItem('carrinho', JSON.stringify(carrinho));
    atualizarContadorCarrinho();
    
    // Feedback visual
    alert(`${nome} adicionado ao carrinho!`);
}

// Função para atualizar contador do carrinho
function atualizarContadorCarrinho() {
    const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    const total = carrinho.reduce((sum, item) => sum + item.quantidade, 0);
    const contador = document.getElementById('cart-count');
    if (contador) {
        contador.textContent = total;
    }
}

// Inicialização quando a página carregar
document.addEventListener('DOMContentLoaded', async () => {
    atualizarContadorCarrinho();
    const produtos = await carregarProdutos();
    exibirProdutos(produtos);
});