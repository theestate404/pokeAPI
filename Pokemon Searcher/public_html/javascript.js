let url = "https://pokeapi.co/api/v2";
let query = "/pokemon/";
let typeColors = {
    normal: "#97a19a",
    fire: "#fc7012",
    water: "#12ebff",
    electric: "#fff838",
    grass: "#3cfa4f",
    ice: "#74fcfa",
    fighting: "#945322",
    poison: "#872ee6",
    ground: "#facf84",
    flying: "#b6d8ee",
    psychic: "#ff57eb",
    bug: "#8aff90",
    rock: "#b58a5c",
    ghost: "#4e2673",
    dragon: "#352673",
    dark: "#421a0d",
    steel: "#7d7b7a",
    fairy: "#ff75ef"
}
let genMap = {
    "generation-i": 1,
    "generation-ii": 2,
    "generation-iii": 3,
    "generation-iv": 4,
    "generation-v": 5,
    "generation-vi": 6,
    "generation-vii": 7,
    "generation-viii": 8,
    "generation-ix": 9
}
let pokemonList = [];
const input = document.getElementById("pokemonInput");
let result = document.getElementById("result")
let evoContainer = document.createElement("div");
window.onload = () => {
    fetch("https://pokeapi.co/api/v2/pokemon?limit=151")
        .then(response => response.json())
        .then(pokeData => {
            let promises = [];
            pokeData.results.forEach(pokemon => {
                promises.push(
                    fetch(pokemon.url)
                        .then(response => response.json()))

            })
            return Promise.all(promises)
        })
        .then(allPokemon => {
            allPokemon.forEach((pokemon, index) => {
                let container = document.createElement("div")
                let dex = document.createElement("div")
                let sprite = document.createElement("img")
                let name = document.createElement("div")

                dex.textContent = "#" + pokemon.id
                dex.className = "dex"

                sprite.src = pokemon.sprites.front_default
                sprite.className = "sprites"

                pokemonList.push(pokemon.name);
                name.textContent = pokemon.name
                name.className = "names"
                name.innerHTML = name.innerHTML.replace("-", " ")
                name.innerHTML = name.innerHTML.charAt(0).toUpperCase() + name.innerHTML.slice(1)

                container.className = "pokemonContainer"
                container.style.animationDelay = `${index * 0.01}s`;

                container.appendChild(dex)
                container.appendChild(sprite)
                container.appendChild(name)
                container.addEventListener("click", function(e) {
                    searchPokemon(pokemon.name)
                })
                result.appendChild(container)

            })
            result.classList.add("loaded");
        })
    console.log(pokemonList)
    autocomplete(input, pokemonList);
}
function searchPokemon(name) {
    result.innerHTML = "";
    let search = url + query + name
    fetch(search)
        .then(response => response.json())
        .then(pokeData => {
            let nameContainer = document.createElement("div")
            let name = document.createElement("div")
            let dex = document.createElement("div")
            let gen = document.createElement("div")
            let spritesContainer = document.createElement("div")
            let sprite = document.createElement("img")
            let spriteShiny = document.createElement("img")
            let flavor = document.createElement("div")
            nameContainer.id = "nameContainer"
            name.id = "name"
            dex.id = "dex"
            gen.id = "gen"
            spritesContainer.id = "spritesContainer"

            name.textContent = pokeData.name
            name.innerHTML = name.innerHTML.replace("-", " ")
            name.innerHTML = name.innerHTML.charAt(0).toUpperCase() + name.innerHTML.slice(1)

            dex.textContent = "#" + pokeData.id

            sprite.src = pokeData.sprites.front_default;

            spriteShiny.src = pokeData.sprites.front_shiny

            nameContainer.appendChild(name)
            nameContainer.appendChild(dex)
            nameContainer.appendChild(gen)
            spritesContainer.appendChild(sprite)
            spritesContainer.appendChild(spriteShiny)
            result.appendChild(nameContainer)
            result.appendChild(spritesContainer)

            let femaleRate = document.createElement("div")
            let maleRate = document.createElement("div")
            let genderRate = document.createElement("div")

            genderRate.appendChild(femaleRate)
            genderRate.appendChild(maleRate)
            result.appendChild(genderRate)

            fetch(pokeData.species.url)
                .then(response => response.json())
                .then(species => {
                    let englishEntries = species.flavor_text_entries.filter(
                        entry => entry.language.name === "en"
                    )

                    flavor.innerHTML = ""

                    englishEntries.forEach(entry => {
                        let flavorText = document.createElement("div")
                        let flavorVersion = document.createElement("div")
                        flavorText.id = "flavorText"
                        flavor.id = "flavorContainer"
                        flavorVersion.textContent = entry.version.name
                        flavorVersion.innerHTML = flavorVersion.innerHTML.charAt(0).toUpperCase() + flavorVersion.innerHTML.slice(1)
                        flavorText.textContent = `Pokémon ${flavorVersion.textContent}: ${entry.flavor_text}`
                            .replace(/\f/g, " ")
                            .replace(/\n/g, " ")
                        flavor.appendChild(flavorText)
                    })
                    gen.textContent = "Gen " + genMap[species.generation.name]
                    if (species.gender_rate == -1) {
                        femaleRate.textContent = "Genderless"
                    }
                    else {
                        femaleRate.textContent = "Female: " + (species.gender_rate / 8) * 100
                        maleRate.textContent = "Male: " + (100 - ((species.gender_rate / 8) * 100))
                    }
                })

            let statsContainer = document.createElement("div")
            let statHeader = document.createElement("div")

            statHeader.textContent = "Stats"

            statsContainer.appendChild(statHeader)
            pokeData.stats.forEach(stat => {
                let rowContainer = document.createElement("div")
                let statName = document.createElement("div")
                let statBar = document.createElement("div")

                statName.textContent = stat.stat.name
                statBar.style.height = "5px"
                statBar.style.width = `${stat.base_stat}px`

                rowContainer.style.display = "flex"
                if (stat.base_stat < 50) {
                    statBar.style.backgroundColor = "red"
                }
                else if (stat.base_stat >= 50 && stat.base_stat < 100) {
                    statBar.style.backgroundColor = "yellow"
                }
                else {
                    statBar.style.backgroundColor = "green"
                }


                rowContainer.appendChild(statName)
                rowContainer.appendChild(statBar)
                statsContainer.appendChild(rowContainer)
            })

            result.appendChild(statsContainer)

            fetch(pokeData.species.url)
                .then(response => response.json())
                .then(species => {
                    fetch(species.evolution_chain.url)
                        .then(response => response.json())
                        .then(evoChain => {
                            if (evoChain.chain.evolves_to.length > 0) {
                                getEvolutionNames(evoChain.chain)

                            }

                        })
                })
            result.appendChild(evoContainer);
            result.appendChild(flavor)
        })
}
function getEvolutionNames(chain) {
    let evolutions = []

    evolutions.push(chain.species.name)

    chain.evolves_to.forEach(evo1 => {
        evolutions.push(evo1.species.name)

        evo1.evolves_to.forEach(evo2 => {
            evolutions.push(evo2.species.name)
        })
    })
    evoContainer.innerHTML = "";

    evolutions.forEach(name => {
        let evoCard = document.createElement("div")
        let evo = document.createElement("div");
        evo.textContent = name.charAt(0).toUpperCase() + name.slice(1);


        let sprite = document.createElement("img")

        evoCard.appendChild(evo);
        evoCard.appendChild(sprite)
        evoCard.addEventListener("click", (event) => {
            searchPokemon(name)
        })
        evoContainer.appendChild(evoCard)
        evoContainer.style.display = "flex"
        fetch(url + query + name)
            .then(response => response.json())
            .then(pokemon => {
                sprite.src = pokemon.sprites.front_default
            })
    });
}
function autocomplete(inp, arr) {
    var currentFocus;

    inp.addEventListener("input", function (e) {
        var a, b, i, val = this.value;
        closeAllLists();
        if (!val) {
            return false;
        }
        currentFocus = -1;
        a = document.createElement("div")
        a.setAttribute("id", this.id + "autocomplete-list")
        a.setAttribute("class", "autocomplete-items")
        this.parentNode.appendChild(a);
        //for each item in the array
        for (i = 0; i < arr.length; i++) {
            if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
                b = document.createElement("div")
                b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "<strong>";
                b.innerHTML += arr[i].substr(val.length);
                b.innerHTML += "<input type ='hidden' value ='" + arr[i] + "'>"
                b.addEventListener("click", function (e) {
                    inp.value = this.getElementsByTagName("input")[0].value
                    closeAllLists()
                    searchPokemon(inp.value)
                })
                a.appendChild(b)
            }
        }
    })
    inp.addEventListener("keydown", function (e) {
        var x = document.getElementById(this.id + "autocomplete-list");
        if (x) x = x.getElementsByTagName("div");
        if (e.keyCode == 40) {
            /*If the arrow DOWN key is pressed,
            increase the currentFocus variable:*/
            currentFocus++;
            /*and and make the current item more visible:*/
            addActive(x);
        } else if (e.keyCode == 38) { //up
            /*If the arrow UP key is pressed,
            decrease the currentFocus variable:*/
            currentFocus--;
            /*and and make the current item more visible:*/
            addActive(x);
        } else if (e.keyCode == 13) {
            /*If the ENTER key is pressed, prevent the form from being submitted,*/
            e.preventDefault();
            if (currentFocus > -1) {
                /*and simulate a click on the "active" item:*/
                if (x) x[currentFocus].click();
            }
        }
    });
    function addActive(x) {
        if (!x) {
            return false
        }
        removeActive(x)
        if (currentFocus >= x.length) {
            currentFocus = 0;
        }
        if (currentFocus < 0) {
            currentFocus = (x.length - 1)
        }
        x[currentFocus].classList.add("autocomplete-active")
    }
    function removeActive(x) {
        for (var i = 0; i < x.length; i++) {
            x[i].classList.remove("autocomplete-active")
        }
    }
    function closeAllLists(elmnt) {
        var x = document.getElementsByClassName("autocomplete-items")
        for (var i = 0; i < x.length; i++) {
            if (elmnt != x[i] && elmnt != inp) {
                x[i].parentNode.removeChild(x[i])
            }
        }
    }
    
}