/**
 * Exibe o modal na tela
 * @param {string} id ID do modal a ser exibido
 */
function openModal(id){
	document.getElementById(id).style.display = 'block';
}

/**
 * Remove o modal da tela
 * @param {string} id ID do modal a ser removido
 */
function closeModal(id){
	document.getElementById(id).style.display = 'none';
}