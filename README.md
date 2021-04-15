
# @allgemein/schema-api

[![build>](https://circleci.com/gh/allgemein-node/schema-api.svg?style=shield)](https://app.circleci.com/pipelines/github/allgemein-node/schema-api)
[![codecov](https://codecov.io/gh/allgemein-node/schema-api/branch/master/graph/badge.svg)](https://codecov.io/gh/allgemein-node/schema-api)
[![Dependency Status](https://david-dm.org/allgemein-node/schema-api.svg)](https://david-dm.org/allgemein-node/schema-api)



With the decorators

@Entity

@Property

@PropertyOf

@Schema

@Object


can be used to define a instancable json schema. 
This can be analysed and dynamically used to instance differetn kind of models.


Transformations:

internal runtime structure -> json schema
json schema -> internal runtime structure
annotation -> internal runtime structure
json schema -> generate classes ES6 + TS
generate classes ES6 + TS -> runtime loading
generate classes ES6 + TS -> json schema
