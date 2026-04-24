import ListaDesplegableElementosGenerica from "./Componentes/ListaDesplegableElementosGenerica.jsx";



export default function LibrosView() {

    const MOCK_CONGRESOS = [
        {
            id: 1,
            nombre: "CIENU 2024",

        },
        {
            id: 2,
            nombre: "CIENU 2025",

        },
        {
            id: 3,
            nombre: "CIENU 2026",

        },
        {
            id: 4,
            nombre: "CIENU 2027",

        }
    ]

    const MOCK_INSTITUCIONES = [
        {
            id: 1,
            nombre: "CIENU",

        },
        {
            id: 2,
            nombre: "RIDMAE",

        }
    ];
    return (
        <div>
            <div>
                <div className="flex gap-4">
                    <div className="border bg-black rounded-full h-10 w-2"></div>
                    <h2 className="flex-1 text-2xl font-bold text-start">Libros</h2>
                </div>
                <p className="pl-12 text-start text-gray-500 mb-3">
                    Aquí se crean los libros de los congresos
                </p>
            </div>
            <div className="flex justify-center gap-10 mb-4">

                <ListaDesplegableElementosGenerica titulo={"Instituciones"} lista={MOCK_INSTITUCIONES} />
                <ListaDesplegableElementosGenerica titulo={"Congresos"} lista={MOCK_CONGRESOS} />
            </div>
            <div>

            </div>
        </div>
    );
}