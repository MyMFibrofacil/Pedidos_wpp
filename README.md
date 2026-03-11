# Pedido WhatsApp (mobile)

App web simple para tomar pedidos y enviarlos por WhatsApp en formato prolijo.

## Uso rápido

1. Abrí `index.html` en el navegador del celular.
2. Elegí productos y cantidades.
3. Tocá **Enviar Pedido por WhatsApp**.

## Configuración

- Número de destino: editar `WHATSAPP_NUMBER` en `app.js`.
  - Formato ejemplo: `5491112345678` (sin `+`, sin espacios).
- Catálogo: editar el arreglo `catalog` en `app.js`.

## Estructura

- `index.html`: interfaz mobile.
- `app.js`: lógica de categorías, búsqueda, cantidades y mensaje a WhatsApp.
