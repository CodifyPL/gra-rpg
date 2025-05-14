export function showInventory() {
    const inventoryScreen = document.createElement('div');
    inventoryScreen.style.position = 'fixed';
    inventoryScreen.style.top = '50%';
    inventoryScreen.style.left = '50%';
    inventoryScreen.style.transform = 'translate(-50%, -50%)';
    inventoryScreen.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    inventoryScreen.style.color = 'white';
    inventoryScreen.style.padding = '20px';
    inventoryScreen.style.borderRadius = '10px';
    inventoryScreen.style.zIndex = '1000';

    inventoryScreen.textContent = 'Ekwipunek: Tutaj będą przedmioty gracza.';

    const closeButton = document.createElement('button');
    closeButton.textContent = 'Zamknij';
    closeButton.onclick = () => {
        document.body.removeChild(inventoryScreen);
    };

    inventoryScreen.appendChild(closeButton);
    document.body.appendChild(inventoryScreen);
}

export function showStats() {
    const statsScreen = document.createElement('div');
    statsScreen.style.position = 'fixed';
    statsScreen.style.top = '50%';
    statsScreen.style.left = '50%';
    statsScreen.style.transform = 'translate(-50%, -50%)';
    statsScreen.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    statsScreen.style.color = 'white';
    statsScreen.style.padding = '20px';
    statsScreen.style.borderRadius = '10px';
    statsScreen.style.zIndex = '1000';

    statsScreen.textContent = 'Statystyki: Tutaj będą statystyki gracza.';

    const closeButton = document.createElement('button');
    closeButton.textContent = 'Zamknij';
    closeButton.onclick = () => {
        document.body.removeChild(statsScreen);
    };

    statsScreen.appendChild(closeButton);
    document.body.appendChild(statsScreen);
}

document.addEventListener('keydown', (event) => {
    if (event.key === 'i') {
        showInventory();
    } else if (event.key === 's') {
        showStats();
    }
});
