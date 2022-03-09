import React, { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { LeafletMouseEvent } from "leaflet";
import api from "./../../services/api";
import axios from "axios";

import Dropzone from "./../../components/Dropzone";

import "./styles.css";

import logo from "./../../assets/logo.svg";

interface Item {
    id: number;
    title: string;
    image_url: string;
}

interface State {
    id: number;
    sigla: string;
    nome: string;
}

interface City {
    id: number;
    nome: string;
}


const CreatePoint = () => {
    const [items, setItems] = useState<Item[]>([]);
    const [states, setStates] = useState<State[]>([]);
    const [cities, setCities] = useState<City[]>([]);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        whatsapp: "",
    });

    const [selectedState, setSelectedState] = useState("0");
    const [selectedCity, setSelectedCity] = useState("0");
    const [selectedPosition, setSelectedPosition] = useState<[number, number]>([0, 0]);
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [selectedFile, setSelectedFile] = useState<File>();

    const navigate = useNavigate();

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            setSelectedPosition([latitude, longitude]);
        });
    }, []);

    useEffect(() => {
        api.get("items").then(res => {
            setItems(res.data);
        });
    }, []);

    useEffect(() => {
        axios.get<State[]>("https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome").then(res => {
            setStates(res.data);
        });
    }, []);

    useEffect(() => {
        if (selectedState === "0") {
            return;
        }

        axios.get(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedState}/municipios?orderBy=nome`).then(res => {
            setCities(res.data);
        });
    }, [selectedState]);

    function handleSelectedState(event: ChangeEvent<HTMLSelectElement>) {
        setSelectedState(event.target.value);
    }

    function handleSelectedCity(event: ChangeEvent<HTMLSelectElement>) {
        setSelectedCity(event.target.value);
    }

    function LocationMarker() {    
        useMapEvents({
            click(event: LeafletMouseEvent) {
                setSelectedPosition([event.latlng.lat, event.latlng.lng]);
            }
        });
    
        return (<Marker position={selectedPosition} />);
    }

    function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
        const {name, value} = event.target;

        setFormData({...formData, [name]: value});
    }

    function handleItemSelect(id: number) {
        const alreadySelected = selectedItems.findIndex(item => item === id);
        if (alreadySelected >= 0) {
            const filteredItems = selectedItems.filter(item => item !== id);
            setSelectedItems(filteredItems);
        }
        else {
            setSelectedItems([...selectedItems, id]);
        }
    }

    function handleSubmit(event: FormEvent) {
        event.preventDefault();

        const { name, email, whatsapp } = formData;
        const uf = selectedState;
        const city = selectedCity;
        const [latitude, longitude] = selectedPosition;
        const items = selectedItems;

        const data = new FormData();
        
        data.append("name", name);
        data.append("email", email);
        data.append("whatsapp", whatsapp);
        data.append("uf", uf);
        data.append("city", city);
        data.append("latitude", String(latitude));
        data.append("longitude", String(longitude));
        data.append("items", items.join(","));

        if (selectedFile) {
            data.append("image", selectedFile);
        }
        
        api.post("points", data);

        alert("Collect point created!");

        navigate("/");
    }

    return (
        <div id="page-create-point">
            <header>
                <img src={logo} alt="Eco app" />

                <Link to="/">
                    <FiArrowLeft />
                    Home
                </Link>
            </header>

            <form onSubmit={handleSubmit}>

                <h1 className="page-name">Register collect point</h1>

                <Dropzone onFileUploaded={setSelectedFile} />

                <fieldset>
                    <legend>
                        <h2>Data</h2>
                    </legend>

                    <div className="field">
                        <label htmlFor="name">Entity name</label>
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
                            <label htmlFor="whatsapp">whatsapp</label>
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
                        <h2>Address</h2>
                        <span>Select the address in the map</span>
                    </legend>

                    <div className="leaflet-container">
                        <MapContainer center={selectedPosition} zoom={2}>
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />

                            <LocationMarker />
                        </MapContainer>
                    </div>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="uf">State</label>
                            <select 
                                name="uf" 
                                value={selectedState} 
                                id="uf" 
                                onChange={handleSelectedState}
                            >
                                <option key="0" value="0">Select the state</option> 
                                {states.map(state => (
                                   <option key={state.id} value={state.sigla}>{state.nome}</option> 
                                ))}
                            </select>
                        </div>

                        <div className="field">
                            <label htmlFor="city">City</label>
                            <select 
                                name="city" 
                                id="city"
                                value={selectedCity}
                                onChange={handleSelectedCity}
                            >
                                <option key="0" value="0">Select the city</option> 
                                {cities.map(city => (
                                    <option key={city.id} value={city.nome}>{city.nome}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Collect items</h2>
                        <span>Select one or more items</span>
                    </legend>

                    <ul className="items-grid">
                        {items.map(item => (
                            <li 
                                key={item.id} 
                                onClick={() => handleItemSelect(item.id)}
                                className={selectedItems.includes(item.id)? "selected" : ""}
                            >
                                <img src={item.image_url} alt={item.title} />
                                <span>{item.title}</span>
                            </li>
                        ))}
                    </ul>
                </fieldset>

                <button type="submit">
                    Register collect point
                </button>
            </form>
        </div>
    );
}

export default CreatePoint;