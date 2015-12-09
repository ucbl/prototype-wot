# Prototype WoT

This is a prototype developed during the internship done by the student LEANO MARTINET Raul Ernesto at the LIRIS laboratory, Lyon, France. The internship was related to the project "Web Serviable" that aims to study semantic communications, principally to identify behaviour patterns in these communications.

The aim of this prototype is to exploit the Hydra vocabulary for describing and reasoning about semantically described services. The different models have been tested with the *Hydra console* presented by \Markus Lanthaler. The idea of these tests was to see if the Hydra documentation used in our models was correct. We have demonstrated that our Hydra descriptions work for a generic client with no embedded knowledge about the application domain.

## Context: the Web of Things (WoT)

With the rapid expansion of the Internet, a large amount of resources such as websites, applications and physical objects are now available through the World Wide Web standards. Also, there is a growing tendency to semantically describe those resources. The WoT is built on these two paradigms.

The [ASAWoO](http://liris.cnrs.fr/asawoo/) project proposes a framework for building WoT applications, based on the concept of avatar. Avatars represent and augment the capabilities of physical objects on the Web, by exposing restful and semantically-described functionalities, that can be composed to form upper-level functionalities.

This prototype was designed as an application for the Web of Things.

## Prototype

We have developed this prototype as a proof-of-concept. It is entirely written in nodeJS and exposes the different layers as separate servers. We have chosen the JS technology because it is lightweigth and easy to setup for this type of demonstrations. The composition process relies on the [N3](https://github.com/RubenVerborgh/N3.js) reasoner. Also, Hydra uses the JSON-LD format which fits our parsers.

The prototype is composed of the following components:

1. A *ontology server* that has the knowledge base needed for our use case scenario. This ontology works as a web service and has an internal inference engine that can receive two useful requests: one to match capabilities into atomic functionalities and the other to find all the incomplete functionalities from another set of functionalities.
2. A *model for the interoperability layer* that simulates objects connected to it. It also has some basic code to simulate the different changes of temperature when we activate a heater or a cooler. This component has a simple user graphical interface where we can see the list of objects and their values.
3. A *model for the functionalities layer* that simulates the ASAWoO project and it is in charge of creating and exposing avatars.
4. A *code repository* that has the necessary code for each composed functionality. In this prototype the code is written in plain JS and it is executed by the avatar using the \textbf{eval} function.

## Instructions

You just need to download all the source code and run:

    sudo npm install
    grunt

The different components are available in:

1. Ontology server: `http://localhost:3232/`
2. Interoperability layer: `http://localhost:3000/`
3. Functionalities layer: `http://localhost:3333/`
4. Code repository: `http://localhost:3535/`

To access the graphical interfaces just open the `index.html` files in the `functionalities-public` and `interoperability-public` folders.

## More information

For more information on this work, you can contact Lionel Médini, Pierre-Antoine Champin or Raul Leano Martinet at the LIRIS laboratory.

# Prototype-WoT V2

Uses [Node](http://nodejs.org/) and [Express](http://expressjs.com/). Based on the MVC structure defined by [terlici](https://github.com/terlici/base-express)

All components are now on the same server (even if it does not correspond to a real use case) to facilitate demonstration purposes.

Real docs needs to be written on this version...
