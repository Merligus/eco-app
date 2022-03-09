import React, { ChangeEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowLeft, FiSearch } from "react-icons/fi";
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import api from "./../../services/api";
import axios from "axios";

import "./styles.css";

import logo from "./../../assets/logo.svg";

interface Point {
    id: number;
    image: string;
    name: string;
    email: string;
    whatsapp: number;
    latitude: number;
    longitude: number;
    city: string;
    uf: string;
    image_url: string;
    items: number[];
}

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

const ListPoints = () => {

    const [points, setPoints] = useState<Point[]>([]);
    const [items, setItems] = useState<Item[]>([]);
    const [states, setStates] = useState<State[]>([]);
    const [cities, setCities] = useState<City[]>([]);

    const [selectedState, setSelectedState] = useState("0");
    const [selectedCity, setSelectedCity] = useState("0");
    const [selectedItems, setSelectedItems] = useState<number[]>([]);

    useEffect(() => {
        api.get("points", { params: { 
            city: selectedCity.includes("0")? "" : selectedCity,
            uf: selectedState.includes("0")? "" : selectedState,
            items: selectedItems.join(",")
        }}).then(res => {
            setPoints(res.data);
        });
    }, [selectedCity, selectedState, selectedItems]);

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

    return (
        <div id="page-list-points">
            <header>
                <img src={logo} alt="Eco app" />

                <Link to="/">
                    <FiArrowLeft />
                    Home
                </Link>
            </header>
            
            <h3 className="page-name">List of all collect points</h3>

            <form>
                <h6 className="page-name"><FiSearch />Search</h6>
                <fieldset>
                    <div className="form-group row">
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

                    <ul className="search-items-grid">
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
            </form>

            <ul>
                {points.map(point => (
                    <li key={point.id}>
                        <div className="card mb-3">
                            <h3 className="card-header">{point.name}</h3>

                            <img 
                                src={point.image_url} 
                                alt={point.name} 
                                style= {{height: 200, objectFit: "cover"}}
                            />

                            <div className="card-body">
                                <h5 className="card-title">E-mail</h5>
                                <h6 className="card-subtitle text-muted">{point.email}</h6>
                            </div>

                            <div className="card-body">
                                <h5 className="card-title">Phone</h5>
                                <h6 className="card-subtitle text-muted">{point.whatsapp}</h6>
                            </div>

                            <div className="card-body">
                                <h5 className="card-title">Address</h5>

                                <div className="leaflet-container">
                                    <MapContainer center={[point.latitude, point.longitude]} zoom={15} scrollWheelZoom={false}>
                                        <TileLayer
                                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        />
                                        
                                        <Marker position={[point.latitude, point.longitude]} />
                                    </MapContainer>
                                </div>
                            </div>

                            <div className="card-body">
                                <h5 className="card-title">State</h5>
                                <h6 className="card-subtitle text-muted">{point.uf}</h6>
                            </div>

                            <div className="card-body">
                                <h5 className="card-title">City</h5>
                                <h6 className="card-subtitle text-muted">{point.city}</h6>
                            </div>

                            <div className="card-body">
                                <h5 className="card-title">Collectable items</h5>
                                <div className="page-list-points">
                                    <ul className="items-grid">
                                        {items.map(item => (
                                            <li 
                                                key={item.id}
                                                className={point.items.includes(item.id)? "selected" : ""}
                                            >
                                                <img src={item.image_url} height="20" alt={item.title} />
                                                <span>{item.title}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default ListPoints;