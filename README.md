# Prototype WoT

This is a prototype for the internship done by the student LEANO MARTINET Raul Ernesto at the LIRIS laboratory.

The internship was related to the project "Web Serviable" that aims to study semantic communications, principally to identify behaviour patterns in these communications.

For more information on the subject please send an email to raul-ernesto.leano-martinet@etu.univ-lyon1.fr

## Abstract

With the rapid expansion of the Internet, a large amount of resources such as websites, applications and physical objects are now available on the World Wide Web. Also, there is a growing tendency to semantically describe those resources.

We have studied the creation of web resource mashups using their semantic basis. We have proposed a framework that provides the necessary tools to understand and analyse the machine to machine (M2M) communication process when creating and performing these mashups.

This framework was designed as an application for the Web of Things and it has a prototype that can be seen as a proof-of-concept.

## Prototype

We have developed this prototype as a proof-of-concept. It is entirely written in nodeJS and exposes the different layers as separate servers. We have chosen the JS technology because it is lightweigth and easy to setup for this type of demonstrations. Also, Hydra uses the JSON-LD format which fits perfectly to our parsers.

The prototype is composed of the following components:

1. A *ontology server* that has the knowledge base needed for our use case scenario. This ontology works as a web service and has an internal inference engine that can receive two useful requests: one to match capabilities into atomic functionalities and the other to find all the incomplete functionalities from another set of functionalities.
2. A *model for the interoperability layer* that simulates objects connected to it. It also has some basic code to simulate the different changes of temperature when we activate a heater or a cooler. This component has a simple user graphical interface where we can see the list of objects and their values.
3. A *model for the functionalities layer* that simulates the ASAWoO project and it is in charge of creating and exposing avatars.
4. A *code repository* that has the necessary code for each composed functionality. In this prototype the code is written in plain JS and it is executed by the avatar using the \textbf{eval} function.

The different models have been also tested with the *Hydra console* presented by \Markus Lanthaler. The idea of these tests was to see if the Hydra documentation used in our models was correct. We have demonstrated that our Hydra descriptions work for a generic client with no embedded knowledge about the application domain.

## Instructions

You just need to download all the source code and run:

    `sudo npm install`

    `grunt`

The different components are available in:

1. Ontology server: `http://localhost:3232/`
2. Interoperability layer: `http://localhost:3000/`
3. Functionalities layer: `http://localhost:3333/`
4. Code repository: `http://localhost:3535/`

To access the graphical interfaces just open the `index.html` files in the `functionalities-public` and `interoperability-public` folders.

## More information

For more information on this work, you can contact Lionel Médini, Pierre-Antoine Champin or Raul Leano Martinet at the LIRIS laboratory.
