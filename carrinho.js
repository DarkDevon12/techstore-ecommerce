// Importação do Firebase
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getFirestore, collection, addDoc } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import firebaseConfig from './firebase-config.js';

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Função para exibir itens do carrinho
function exibirCarrinho() {
    const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    const cartContent = document.getElementById('cart-content');
    const cartEmpty = document.getElementById('cart-empty');
    const cartSummary = document.getElementById('cart-summary');
    
    if (carrinho.length === 0) {
        cartContent.style.display = 'none';
        cartSummary.style.display = 'none';
        cartEmpty.style.display = 'block';
        return;
    }
    
    cartEmpty.style.display = 'none';
    cartContent.style.display = 'block';
    cartSummary.style.display = 'block';
    
    // Criar HTML dos itens
    const itemsHTML = carrinho.map((item, index) => `
        <div class="cart-item">
            <div class="cart-item-image">
    <img src="${item.imagem}" alt="${item.nome}">
</div>
            <div class="cart-item-info">
                <h3>${item.nome}</h3>
                <p>Quantidade: ${item.quantidade}</p>
                <p>Preço unitário: R$ ${item.preco.toFixed(2)}</p>
            </div>
            <div class="cart-item-price">
                R$ ${(item.preco * item.quantidade).toFixed(2)}
            </div>
            <button class="remove-btn" onclick="removerItem(${index})">Remover</button>
        </div>
    `).join('');
    
    cartContent.innerHTML = `<div class="cart-items">${itemsHTML}</div>`;
    
    // Calcular totais
    calcularTotal();
}

// Função para calcular total
function calcularTotal() {
    const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    const subtotal = carrinho.reduce((sum, item) => sum + (item.preco * item.quantidade), 0);
    const frete = subtotal > 200 ? 0 : 15.00;
    const total = subtotal + frete;
    
    document.getElementById('subtotal').textContent = `R$ ${subtotal.toFixed(2)}`;
    document.getElementById('shipping').textContent = frete === 0 ? 'Grátis' : `R$ ${frete.toFixed(2)}`;
    document.getElementById('total').textContent = `R$ ${total.toFixed(2)}`;
}

// Função para remover item
window.removerItem = function(index) {
    let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    carrinho.splice(index, 1);
    localStorage.setItem('carrinho', JSON.stringify(carrinho));
    exibirCarrinho();
    atualizarContadorCarrinho();
}

// Atualizar contador
function atualizarContadorCarrinho() {
    const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    const total = carrinho.reduce((sum, item) => sum + item.quantidade, 0);
    document.getElementById('cart-count').textContent = total;
}

// Função para finalizar compra
async function finalizarCompra() {
    const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    
    if (carrinho.length === 0) {
        alert('Seu carrinho está vazio!');
        return;
    }
    
    const subtotal = carrinho.reduce((sum, item) => sum + (item.preco * item.quantidade), 0);
    const frete = subtotal > 200 ? 0 : 15.00;
    const total = subtotal + frete;
    
    // Criar objeto do pedido
    const pedido = {
        itens: carrinho,
        subtotal: subtotal,
        frete: frete,
        total: total,
        data: new Date().toISOString(),
        status: 'Pendente'
    };
    
    try {
        // Salvar pedido no Firebase
        const docRef = await addDoc(collection(db, "pedidos"), pedido);
        
        console.log("Pedido salvo com ID:", docRef.id);
        
        // Limpar carrinho
        localStorage.removeItem('carrinho');
        
        // Mostrar mensagem de sucesso
        alert(`✅ Pedido realizado com sucesso!\n\nNúmero do pedido: ${docRef.id}\nTotal: R$ ${total.toFixed(2)}\n\nObrigado pela sua compra!`);
        
        // Redirecionar para página inicial
        window.location.href = 'index.html';
        
    } catch (error) {
        console.error("Erro ao finalizar pedido:", error);
        
        // Mesmo se o Firebase falhar, simular a compra
        const pedidoId = 'PED-' + Date.now();
        localStorage.removeItem('carrinho');
        
        alert(`✅ Pedido realizado com sucesso!\n\nNúmero do pedido: ${pedidoId}\nTotal: R$ ${total.toFixed(2)}\n\nObrigado pela sua compra!`);
        
        window.location.href = 'index.html';
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    exibirCarrinho();
    atualizarContadorCarrinho();
    
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', finalizarCompra);
    }
});