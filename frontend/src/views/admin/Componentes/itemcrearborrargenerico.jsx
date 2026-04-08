// Importamos iconos de react
import React from 'react';
import { MdChat, MdFolder, MdCheckCircle, MdVisibility, MdEdit } from 'react-icons/md';
import { MdDateRange } from "react-icons/md";


// items que usare
const items = [
  { icon: <MdChat color="#fff" />, label: 'Ítem 1', value: 'r1' },
  { icon: <MdFolder color="#fff" />, label: 'Ítem 2', value: 'r2' },
  { icon: <MdCheckCircle color="#fff" />, label: 'Ítem 3', value: 'r3' },
];


/**
 * @param {function} onPropertyClick - Función que llama al hacer click
 */
const Itemcrearborrargenerico = ({ onPropertyClick, titulo, listaItems,listaDatos }) => (
  <div
    // Area de la tarjeta
    style={{
      width: 290,
      height: 435,
      background: '#fff',
      borderRadius: 24,
      padding: 16,
      border: '2px solid #111',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
    }}
  >
    {/*Botón para insertar un nuevo elemento*/}
    <button
      style={{
        width: '100%',
        background: 'black',
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

    {/* Lista de ítems con icono, etiqueta y botón */}
    <div>
      {items.map((item, idx) => (
        <div
          key={idx}
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: 10,
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div
              style={{
                width: 36,
                height: 36,
                background: 'black',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16,
                marginRight: 10,
              }}
            >
              {item.icon}
            </div>
            <span style={{ fontSize: 16, color: '#111' }}>{item.label}</span>
          </div>
          {/* Botón funcional */}
          <button
            style={{
              width: 70,
              height: 40,
              borderRadius: 20,
              border: '2px solid black',
              background: '#fff',
              fontSize: 16,
              
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
    {/*Fechas*/}
    <div>
      {/*Fecha y hora inicio*/}
      <div className='w-60 h-15 items-center text-left mb-4'>
        <h3 className='pl-4'>Fecha inicio</h3>
        <div className='flex h-10'>
          <div className="flex shrink-0 px-3 justify-center rounded-l-full h-full bg-black text-white items-center"><MdDateRange /></div>
          <input className="w-55 bg-white border rounded-r-full h-full pl-4" type="datetime-local" readOnly/>

        </div>
        

      </div>

      {/*Fecha y hora final*/}
      <div className='w-60 h-15 items-center text-left mb-4'>
        <h3 className='pl-4'>Fecha fin</h3>
        <div className='flex h-10'>
          <div className="flex shrink-0 px-3 justify-center rounded-l-full h-full bg-black text-white items-center"><MdDateRange /></div>
          <input className="w-55 bg-white border rounded-r-full h-full pl-4" type="datetime-local" readOnly/>

        </div>
        

      </div>
      
      

    </div>

    {/* Botones funcionales: ver y editar */}
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <button
        style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          background: 'black',
          border: 'none',
          color: '#fff',
          
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <MdVisibility className="w-6 h-6" color="#fff" />
      </button>
      <button
        style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          background: 'black',
          border: 'none',
          color: '#fff',
          
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <MdEdit className="w-6 h-6 text-white"/>
      </button>
    </div>
        
  </div>
);

export default Itemcrearborrargenerico;