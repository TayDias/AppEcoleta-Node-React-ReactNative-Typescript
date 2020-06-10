import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react'
import { Link, useHistory } from 'react-router-dom'
import { FiArrowLeft } from 'react-icons/fi'
import { Map, TileLayer, Marker } from 'react-leaflet'
import { LeafletMouseEvent } from 'leaflet'
import axios from 'axios'
import api from '../../services/api'

import './styles.css'

import logo from '../../assets/logo.svg'

//Representação do formato dos atributos retornados pela api
interface Item {
    id: number;
    name: string,
    image: string
}

interface IBGEUfResponse {
    sigla: string
}

interface IBGECityResponse {
    nome: string
}

const CreatePoint = () => {
    // useState com formato de retorno especificado
    const [items, setItems] = useState<Item[]>([])
    const [ufs, setUfs] = useState<string[]>([])
    const [cities, setCities] = useState<string[]>([])

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        whatsapp: ''
    })

    const [initialPosition, setInitialPosition] = useState<[number, number]>([0, 0])
    const [selectedPosition, setSelectedPosition] = useState<[number, number]>([0, 0])

    const [selectedUf, setSelectedUf] = useState('0')
    const [selectedCity, setSelectedCity] = useState('0')
    const [selectedItems, setSelectedItems] = useState<number[]>([])

    const history = useHistory()

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords

            setInitialPosition([latitude, longitude])
        })
    }, [])

    useEffect(() => {
        axios.get<IBGEUfResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome').then(response => {
            const ufInitials = response.data.map(uf => uf.sigla)

            setUfs(ufInitials)
        })
    }, [])

    useEffect(() => {
        if(selectedUf === "0") {
            return
        }
        
        axios
            .get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`)
            .then(response => {
                const cityNames = response.data.map(city => city.nome)

                setCities(cityNames)
            })
    }, [selectedUf])

    useEffect(() => {
        api.get('items').then(response => {
            setItems(response.data)
        })
    }, [])

    function handleInputChange (event: ChangeEvent<HTMLInputElement>) {
        const { name, value } = event.target

        // Manter os dados que já existem usando um Spread Operator. 
        // ++ Nome da variável referenciado de forma dinâmica
        setFormData({ ...formData, [name]: value })
    }

    function handleMapClick (event: LeafletMouseEvent) {
        setSelectedPosition([
            event.latlng.lat,
            event.latlng.lng
        ])
    }

    function handleSelectUf (event: ChangeEvent<HTMLSelectElement>) {
        const uf = event.target.value

        setSelectedUf(uf)
    }

    function handleSelectCity (event: ChangeEvent<HTMLSelectElement>) {
        const city = event.target.value

        setSelectedCity(city)
    }

    function handleSelectItem (id: number) {
        //Verificar se o id esta na lista de itens selecionados e retornar a posição, ou -1 caso não estiver
        const alreadySelected = selectedItems.findIndex(item => item === id)

        //Caso esteja na lista, remover com o uso de um filtro
        if(alreadySelected >= 0) {
            //Mantem todos os itens que são diferentes de id
            const filteredItems = selectedItems.filter(item => item !== id)

            setSelectedItems(filteredItems)
        }
        //Caso não esteja na lista, incluir mantendo os demais
        else {
            setSelectedItems([ ...selectedItems ,id])
        }
    }

    async function handleSubmit (event: FormEvent) {
        //Impede o recarregamento padrão do javascript
        event.preventDefault()

        const {name, email, whatsapp } = formData
        const uf = selectedUf
        const city = selectedCity
        const [latitude, longitude] = selectedPosition
        const items = selectedItems

        const data = {
            name,
            email,
            whatsapp,
            uf,
            city,
            latitude,
            longitude,
            items
        }

        await api.post('point', data)

        alert('Ponto de coleta criado')

        history.push('/')
    }

    return(
        <div id="page-create-point">
            <header>
                <img src={logo} alt="Ecoleta" />

                <Link to="/">
                    <FiArrowLeft />
                    Voltar para home
                </Link>
            </header>

            <form onSubmit={handleSubmit}>
                <h1>Cadastro do <br />ponto de coleta</h1>
                
                <fieldset>
                    <legend>
                        <h2>Dados</h2>
                    </legend>

                    <div className="field">
                        <label htmlFor="name">Nome da entidade</label>
                        <input 
                            type="text"
                            name="name"
                            id="name"
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="email">E-mail</label>
                            <input 
                                type="email"
                                name="email"
                                id="email"
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="field">
                            <label htmlFor="whatsapp">Whatsapp</label>
                            <input 
                                type="text"
                                name="whatsapp"
                                id="whatsapp"
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Endereço</h2>
                        <span>Selecione o endereço no mapa</span>
                    </legend>

                    <Map center={initialPosition} zoom={15} onclick={handleMapClick}>
                        <TileLayer
                            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        <Marker 
                            position={selectedPosition}
                        />
                    </Map>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="uf">Estado (UF)</label>

                            <select 
                                name="uf" 
                                id="uf" 
                                value={selectedUf} 
                                onChange={handleSelectUf}
                            >
                                <option value="0">Selecione uma UF</option>
                                {ufs.map(uf => (
                                    <option key={uf} value={uf}>{uf}</option>
                                ))}
                            </select>
                        </div>

                        <div className="field">
                            <label htmlFor="city">Cidade</label>
                            <select 
                                name="city" 
                                id="city"
                                value={selectedCity}
                                onChange={handleSelectCity}
                            >
                                <option value="0">Selecione uma cidade</option>
                                {cities.map(city => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Ítems de Coleta</h2>
                        <span>Selecione um ou mais itens abaixo</span>
                    </legend>

                    <ul className="items-grid">
                        {items.map(item => (
                            <li 
                                key={item.id} 
                                onClick={() => handleSelectItem(item.id)}
                                className={selectedItems.includes(item.id) ? 'selected' : ''} //Se tem o item na seleção atribui a classe
                            >
                                <img src={item.image} alt={item.name}/>
                                <span>{item.name}</span>
                            </li>  
                        ))}                          
                    </ul>              
                </fieldset>

                <button type="submit">
                    Cadastrar ponto de coleta
                </button>
            </form>
        </div>
    )
}

export default CreatePoint