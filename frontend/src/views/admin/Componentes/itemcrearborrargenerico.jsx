// Importamos iconos de react
import React from 'react';
import { MdChat, MdFolder, MdCheckCircle, MdVisibility, MdEdit } from 'react-icons/md';


// items que usare
const items = [
  { icon: <MdChat color="#fff" />, label: 'Ítem 1', value: 'r1' },
  { icon: <MdFolder color="#fff" />, label: 'Ítem 2', value: 'r2' },
  { icon: <MdCheckCircle color="#fff" />, label: 'Ítem 3', value: 'r13' },
];


/**
 * @param {function} onPropertyClick - Función que llama al hacer click
 */
const Itemcrearborrargenerico = ({ onPropertyClick }) => (
  <div
    // Area de la tarjeta
    style={{
      width: 329,
      height: 384,
      background: '#fff',
      borderRadius: 24,
      padding: 16,
      border: '2px solid #111',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
    }}
  >
    /* Botón para insertar un nuevo elemento */
    <button
      style={{
        width: '100%',
        background: '#005f73',
        color: '#fff',
        border: 'none',
        borderRadius: 24,
        padding: '12px 0',
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 16,
      }}
    >
      Insertar elemento
    </button>

    /* Lista de ítems con icono, etiqueta y botón */
    <div>
      {items.map((item, idx) => (
        <div
          key={idx}
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: 18,
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div
              style={{
                width: 36,
                height: 36,
                background: '#005f73',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20,
                marginRight: 10,
              }}
            >
              {item.icon}
            </div>
            <span style={{ fontSize: 22, color: '#111' }}>{item.label}</span>
          </div>
          /* Botón funcional */
          <button
            style={{
              width: 70,
              height: 40,
              borderRadius: 20,
              border: '2px solid #005f73',
              background: '#fff',
              fontSize: 22,
              fontWeight: 'bold',
              color: '#111',
              cursor: 'pointer',
            }}
            onClick={() => onPropertyClick(item)}
          >
            {item.value}
          </button>
        </div>
      ))}
    </div>

    /* Botones funcionales: ver y editar */
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <button
        style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: '#005f73',
          border: 'none',
          color: '#fff',
          fontSize: 28,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <MdVisibility color="#fff" />
      </button>
      <button
        style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: '#005f73',
          border: 'none',
          color: '#fff',
          fontSize: 28,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <MdEdit color="#fff" />
      </button>
    </div>
  </div>
);

export default Itemcrearborrargenerico;