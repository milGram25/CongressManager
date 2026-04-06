import React from "react";
import {
  MdAccessTime,
  MdContentCopy,
  MdDownload,
  MdGroups,
  MdLocationOn,
  MdOutlineStarBorder,
  MdVideocam,
  MdVisibility,
} from "react-icons/md";

// Estilo base para los iconos de cada fila
const rowIconStyle = {
  color: "#fff",
  fontSize: 24,
};

// Filas que se mostraran con la informacion del evento
function buildRows(event) {
  return [
    {
      key: "cupos",
      label: "Cupos",
      value: event?.cupos ?? "-",
      icon: <MdGroups style={rowIconStyle} />,
    },
    {
      key: "lugar",
      label: "Lugar",
      value: event?.lugar ?? "-",
      icon: <MdLocationOn style={rowIconStyle} />,
    },
    {
      key: "fechaHora",
      label: "Fecha y hora",
      value: event ? `${event.fecha} - ${event.hora}` : "-",
      icon: <MdAccessTime style={rowIconStyle} />,
    },
    {
      key: "enlace",
      label: "Enlace",
      value: event?.enlace ?? "-",
      icon: <MdVideocam style={rowIconStyle} />,
      isLink: true,
    },
  ];
}

/**
 * @param {object} event - Evento seleccionado en la agenda
 * @param {function} onViewField - Funcion opcional para ver un dato
 * @param {function} onDownload - Funcion opcional para descargar
 * @param {function} onFavorite - Funcion opcional para destacar
 */
function DetallesAgenda({ event, onViewField, onDownload, onFavorite }) {
  // Si no hay evento, no mostramos nada
  if (!event) {
    return null;
  }

  // Construimos las filas con base en el evento recibido
  const rows = buildRows(event);

  // Copiar el valor de una fila al portapapeles
  const copyValue = async (value) => {
    if (
      typeof navigator !== "undefined" &&
      navigator.clipboard &&
      typeof navigator.clipboard.writeText === "function"
    ) {
      try {
        await navigator.clipboard.writeText(String(value));
      } catch {
        
      }
    }
  };

  // Ver el valor de una fila o abrir el enlace si aplica
  const viewValue = (row) => {
    if (onViewField) {
      onViewField(row, event);
      return;
    }

    if (
      row.isLink &&
      row.value &&
      row.value !== "-" &&
      typeof window !== "undefined"
    ) {
      window.open(row.value, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 792,
        minHeight: 435,
        background: "#fff",
        borderRadius: 40,
        border: "2px solid #111",
        padding: "22px 24px 18px",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        gap: 16,
      }}
    >
      {/* Encabezado con nombre y descripcion del evento */}
      <div>
        <h2
          style={{
            margin: 0,
            fontSize: 27,
            lineHeight: 1.2,
            fontWeight: 500,
            color: "#222",
          }}
        >
          {event.title || "Nombre evento seleccionado (ponencia o taller)"}
        </h2>
        <p
          style={{
            margin: "10px 0 0",
            fontSize: 16,
            color: "#6d6d6d",
          }}
        >
          {event.description || "Descripcion"}
        </p>
      </div>

      {/* Lista de detalles del evento */}
      <div style={{ flex: 1 }}>
        {rows.map((row, index) => (
          <div
            key={row.key}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "12px 4px",
              borderBottom: "1px solid #bfbfbf",
              marginTop: index === 0 ? 18 : 0,
            }}
          >
            {/* Icono de la fila */}
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                background: "#0b7890",
                border: "2px solid #0b4d5b",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {row.icon}
            </div>

            {/* Nombre del campo */}
            <div
              style={{
                flex: 1,
                fontSize: 21,
                fontWeight: 700,
                color: "#111",
              }}
            >
              {row.label}
            </div>

            {/* Valor del campo */}
            <div
              style={{
                minWidth: 118,
                maxWidth: 280,
                height: 46,
                borderRadius: 24,
                border: "2px solid #6b6b6b",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0 16px",
                boxSizing: "border-box",
                fontSize: 18,
                fontWeight: 700,
                color: "#222",
                overflow: "hidden",
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
              }}
              title={String(row.value)}
            >
              {row.value}
            </div>

            {/* Boton para copiar */}
            <button
              type="button"
              onClick={() => copyValue(row.value)}
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                border: "2px solid #0b4d5b",
                background: "#0b7890",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                flexShrink: 0,
              }}
              title={`Copiar ${row.label.toLowerCase()}`}
            >
              <MdContentCopy size={24} />
            </button>

            {/* Boton para ver visualizar */}
            <button
              type="button"
              onClick={() => viewValue(row)}
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                border: "2px solid #0b4d5b",
                background: "#0b7890",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                flexShrink: 0,
              }}
              title={`Ver ${row.label.toLowerCase()}`}
            >
              <MdVisibility size={24} />
            </button>
          </div>
        ))}
      </div>

      {/* Botones inferiores */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 8,
            padding: 4,
            borderRadius: 28,
            border: "2px solid #7e7e7e",
          }}
        >
          {/* Boton de descarga */}
          <button
            type="button"
            onClick={onDownload}
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              border: "2px solid #0b4d5b",
              background: "#0b7890",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
            title="Descargar"
          >
            <MdDownload size={24} />
          </button>
          {/* Boton para favoritos */}
          <button
            type="button"
            onClick={onFavorite}
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              border: "2px solid #0b4d5b",
              background: "#0b7890",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
            title="Destacar"
          >
            <MdOutlineStarBorder size={24} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default DetallesAgenda;
