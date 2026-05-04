import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ListaExtensos from "./Componentes/ListaExtensos";
import { getCongresosApi, getEvaluadoresDisponiblesApi } from "../../api/adminApi";
import { getExtensosCongreso, asignarEvaluadoresApi, asignarEvaluador3Api, buildMediaUrl } from "../../api/ponenciasApi";
import BuscadorPersonal from "./Componentes/BuscadorPersonal";

function LedStatus({ label, active, neutral = false, color = null }) {
  const bg = neutral ? 'bg-gray-400' : color ?? (active ? 'bg-green-500' : 'bg-red-500');
  return (
    <div className="flex items-center gap-2">
      <div className={`w-3 h-3 rounded-full ${bg} shadow-sm`} />
      <span className="text-xs font-medium text-gray-600">{label}</span>
    </div>
  );
}

function RubricaGrupoStatusRow({ grupo }) {
  return (
    <div className="mb-5 ml-2">
      <h4 className="text-[12px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-2 mb-1">
        {grupo.nombre_grupo}
      </h4>
      {grupo.criterios?.map((criterio, i) => (
        <div key={i} className="flex items-center justify-between border-b border-slate-200 py-3 last:border-b-0 pl-2 ml-2">
          <div className="flex-1">
            <span className="text-sm font-medium text-slate-700">{criterio.nombre_criterio}</span>
            {criterio.comentario_especifico && (
              <p className="text-xs text-slate-400 mt-0.5">{criterio.comentario_especifico}</p>
            )}
          </div>
          <div className="flex items-center gap-2 ml-3">
            {Array.from({ length: criterio.peso ?? 5 }, (_, idx) => {
              const v = idx + 1;
              return (
                <div key={v} className={`flex h-6 w-6 items-center justify-center rounded-full border text-[11px] font-semibold ${v <= (criterio.puntaje ?? 0) ? 'bg-black text-white' : 'border-slate-800 bg-white text-slate-700'}`}>{v}</div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function ExtensoDetailCard({ extenso, evaluadoresDisponibles, idCongreso, onAsignarDos, onAsignarTres, toast }) {
  const navigate = useNavigate();
  const [r1Sel, setR1Sel] = useState('');
  const [r2Sel, setR2Sel] = useState('');
  const [r3Sel, setR3Sel] = useState('');
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    setR1Sel(extenso?.id_evaluador ? String(extenso.id_evaluador) : '');
    setR2Sel(extenso?.id_evaluador_2 ? String(extenso.id_evaluador_2) : '');
    setR3Sel('');
  }, [extenso?.id_extenso]);

  if (!extenso) return (
    <article className="rounded-[28px] border border-black/55 bg-white p-6 shadow-sm">
      <p className="text-sm text-slate-500">No hay un extenso seleccionado.</p>
    </article>
  );

  const estado = extenso.estado_derivado ?? 'en_revision';
  const yaAsignados = extenso.id_evaluador && extenso.id_evaluador_2;
  const evaluadoresParaR3 = evaluadoresDisponibles.filter(
    e => e.id_evaluador !== extenso.id_evaluador && e.id_evaluador !== extenso.id_evaluador_2
  );

  const handleAsignarDos = async () => {
    if (!r1Sel || !r2Sel) return;
    setAssigning(true);
    try {
      await onAsignarDos(extenso.id_extenso, Number(r1Sel), Number(r2Sel));
    } finally {
      setAssigning(false);
    }
  };

  const handleAsignarTres = async () => {
    if (!r3Sel) return;
    setAssigning(true);
    try {
      await onAsignarTres(extenso.id_extenso, Number(r3Sel));
    } catch (err) {
      toast(err.message);
    } finally {
      setAssigning(false);
    }
  };

  const handlePublicar = () => {
    const tipo = extenso.tipo_ponencia === 'taller' ? 'talleres' : 'ponencias';
    const nombre = encodeURIComponent(extenso.title ?? '');
    const subarea = extenso.id_subarea ?? '';
    navigate(`/admin/eventos/${tipo}/crear?id_congreso=${idCongreso}&nombre_evento=${nombre}&id_subarea=${subarea}`);
  };

  const grupos = extenso.evaluacion?.grupos ?? null;

  return (
    <article className="flex min-h-[760px] flex-col rounded-[28px] border border-black/55 bg-white px-5 py-5 shadow-sm md:px-6 space-y-6">
      <section>
        <h3 className="text-[14px] font-semibold uppercase tracking-wide text-slate-700">Información de extenso</h3>
        <div className="mt-4 space-y-2 text-[14px] leading-6 text-slate-700">
          <p><span className="font-semibold text-slate-900">Título:</span> {extenso.title}</p>
          <p><span className="font-semibold text-slate-900">Autores:</span> {extenso.autores?.join(' / ') || 'Sin autores'}</p>
          {extenso.ruta_extenso && (
            <a
              href={buildMediaUrl(extenso.ruta_extenso)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block btn btn-outline btn-xs rounded-lg mt-1"
            >
              Descargar archivo
            </a>
          )}
        </div>
      </section>

      <section className="flex flex-wrap gap-3 p-4 bg-gray-50 rounded-2xl">
        <LedStatus label="Revisores asignados" active={!!yaAsignados} />
        <LedStatus label="En revisión" active={!!yaAsignados && estado !== 'extenso_aceptado' && estado !== 'extenso_rechazado'} neutral={!yaAsignados} />
        {estado === 'desacuerdo' && <LedStatus label="Desacuerdo" active={true} color="bg-orange-500" />}
        <LedStatus label="Aceptado" active={estado === 'extenso_aceptado'} neutral={estado !== 'extenso_aceptado' && estado !== 'extenso_rechazado'} />
      </section>

      {(extenso.nombre_evaluador || extenso.nombre_evaluador_2 || extenso.nombre_evaluador_3) && (
        <section>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-700 mb-1">Revisores asignados</h4>
          <div className="space-y-1 text-sm text-slate-600">
            {extenso.nombre_evaluador && <p>R1: {extenso.nombre_evaluador}</p>}
            {extenso.nombre_evaluador_2 && <p>R2: {extenso.nombre_evaluador_2}</p>}
            {extenso.nombre_evaluador_3 && <p>R3 (Desempate): {extenso.nombre_evaluador_3}</p>}
          </div>
        </section>
      )}

      {!yaAsignados && !extenso.revisado && (
        <section>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-700 mb-2">Asignar revisores (ambos obligatorios)</h4>
          {evaluadoresDisponibles.length === 0 ? (
            <p className="text-xs text-amber-600 italic">No hay evaluadores asignados a este congreso.</p>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase text-slate-400 ml-1">Revisor 1</p>
                  <BuscadorPersonal
                    options={evaluadoresDisponibles}
                    value={r1Sel}
                    onChange={setR1Sel}
                    placeholder="Busca Revisor 1..."
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase text-slate-400 ml-1">Revisor 2</p>
                  <BuscadorPersonal
                    options={evaluadoresDisponibles}
                    value={r2Sel}
                    onChange={setR2Sel}
                    placeholder="Busca Revisor 2..."
                  />
                </div>
              </div>
              {r1Sel && r2Sel && r1Sel === r2Sel && (
                <p className="text-xs text-error font-medium">El Revisor 1 y el Revisor 2 no pueden ser la misma persona.</p>
              )}
              <button
                onClick={handleAsignarDos}
                disabled={!r1Sel || !r2Sel || r1Sel === r2Sel || assigning}
                className="w-full btn btn-primary btn-sm rounded-xl disabled:opacity-50"
              >
                {assigning ? 'Asignando...' : 'Asignar revisores'}
              </button>
            </div>
          )}
        </section>
      )}

      {estado === 'desacuerdo' && !extenso.id_evaluador_3 && (
        <section>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-orange-600 mb-2">Asignar 3er revisor (desempate)</h4>
          <div className="flex gap-2">
            <BuscadorPersonal
              options={evaluadoresParaR3}
              value={r3Sel}
              onChange={setR3Sel}
              placeholder="Selecciona revisor 3"
            />
            <button
              onClick={handleAsignarTres}
              disabled={!r3Sel || assigning}
              className="btn btn-black w-full rounded-xl disabled:opacity-50 mt-2"
            >
              {assigning ? 'Asignando...' : 'Confirmar tercer revisor'}
            </button>
          </div>
        </section>
      )}

      {estado === 'extenso_aceptado' && (
        <section>
          <button
            onClick={handlePublicar}
            className="w-full btn btn-success rounded-xl uppercase tracking-wider font-bold"
          >
            Publicar ponencia
          </button>
        </section>
      )}

      <section>
        <h3 className="text-[14px] font-semibold uppercase tracking-wide text-slate-700 mb-3">Rúbrica de evaluación (última)</h3>
        <div className="overflow-y-auto max-h-[250px]">
          {!grupos || grupos.length === 0 ? (
            <p className="text-sm text-slate-400 italic">Sin evaluación enviada aún.</p>
          ) : (
            grupos.map((grupo, i) => <RubricaGrupoStatusRow key={i} grupo={grupo} />)
          )}
        </div>
      </section>

      {extenso.evaluacion?.estatus && (
        <section>
          <h3 className="text-[14px] font-semibold uppercase tracking-wide text-slate-700">Estatus de evaluación</h3>
          <div className="mt-2 rounded-[18px] border border-black/60 bg-[#f4f4f4] p-4 text-sm leading-6 text-slate-700">
            {extenso.evaluacion.estatus}
          </div>
        </section>
      )}
    </article>
  );
}

export default function ProcesosExtensosView() {
  const accessToken = localStorage.getItem('congress_access');
  const [congresos, setCongresos] = useState([]);
  const [selectedCongreso, setSelectedCongreso] = useState(null);
  const [items, setItems] = useState([]);
  const [evaluadores, setEvaluadores] = useState([]);
  const [viewItem, setViewItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => {
    getCongresosApi(accessToken).then(setCongresos).catch(console.error);
  }, [accessToken]);

  useEffect(() => {
    if (!selectedCongreso) return;
    setLoading(true);
    Promise.all([
      getExtensosCongreso(accessToken, selectedCongreso.id_congreso),
      getEvaluadoresDisponiblesApi(accessToken, selectedCongreso.id_congreso),
    ])
      .then(([extData, evalData]) => {
        setItems(extData);
        setEvaluadores(evalData);
        setViewItem(extData[0] ?? null);
      })
      .catch(err => {
        console.error("Error al cargar datos de extensos:", err);
      })
      .finally(() => setLoading(false));
  }, [selectedCongreso, accessToken]);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const refreshExtenso = (idExtenso, patch) => {
    setItems(prev => prev.map(item => item.id_extenso === idExtenso ? { ...item, ...patch } : item));
    if (viewItem?.id_extenso === idExtenso) {
      setViewItem(prev => ({ ...prev, ...patch }));
    }
  };

  const handleAsignarDos = async (idExtenso, r1, r2) => {
    await asignarEvaluadoresApi(accessToken, idExtenso, r1, r2);
    const ev1 = evaluadores.find(e => e.id_evaluador === r1);
    const ev2 = evaluadores.find(e => e.id_evaluador === r2);
    refreshExtenso(idExtenso, {
      asignado: true,
      id_evaluador: r1,
      id_evaluador_2: r2,
      nombre_evaluador: ev1?.nombre_completo ?? null,
      nombre_evaluador_2: ev2?.nombre_completo ?? null,
      estado_derivado: 'en_revision',
    });
  };

  const handleAsignarTres = async (idExtenso, r3) => {
    await asignarEvaluador3Api(accessToken, idExtenso, r3);
    const ev3 = evaluadores.find(e => e.id_evaluador === r3);
    refreshExtenso(idExtenso, {
      id_evaluador_3: r3,
      nombre_evaluador_3: ev3?.nombre_completo ?? null,
    });
  };

  return (
    <div className="w-full space-y-7">
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 alert alert-error shadow-lg max-w-sm">
          <span>{toastMsg}</span>
        </div>
      )}
      <section className="flex flex-wrap items-center gap-3 border-t border-base-300 pt-7">
        <div>
          <div className="flex gap-4">
            <div className="border bg-black rounded-full h-10 w-2"></div>
            <h2 className="flex-1 text-2xl font-bold text-start">Revisión de extensos</h2>
          </div>
          <p className="pl-12 text-start text-gray-500 mb-3">Aquí se gestiona la revisión de extensos.</p>
        </div>
        <select
          className="select select-bordered ml-auto rounded-xl"
          value={selectedCongreso?.id_congreso ?? ''}
          onChange={e => {
            const found = congresos.find(c => String(c.id_congreso) === e.target.value);
            setSelectedCongreso(found ?? null);
          }}
        >
          <option value="">Selecciona un congreso</option>
          {congresos.map(c => (
            <option key={c.id_congreso} value={c.id_congreso}>{c.nombre_congreso}</option>
          ))}
        </select>
      </section>

      {!selectedCongreso ? (
        <p className="text-center py-10 text-base-content/40 italic">Selecciona un congreso para ver los extensos.</p>
      ) : loading ? (
        <div className="flex justify-center py-10"><span className="loading loading-spinner loading-lg text-primary"></span></div>
      ) : items.length === 0 ? (
        <p className="text-center py-10 text-base-content/40 italic">No hay ponencias con extenso en este congreso.</p>
      ) : (
        <section className="grid items-start gap-6 xl:grid-cols-2">
          <ListaExtensos
            listaElementos={items}
            dictaminadores={evaluadores}
            selectedId={viewItem?.id ?? null}
            onView={setViewItem}
          />
          <ExtensoDetailCard
            extenso={viewItem}
            evaluadoresDisponibles={evaluadores}
            idCongreso={selectedCongreso.id_congreso}
            onAsignarDos={handleAsignarDos}
            onAsignarTres={handleAsignarTres}
            toast={showToast}
          />
        </section>
      )}
    </div>
  );
}
