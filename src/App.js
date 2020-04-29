import React, { useState } from 'react';
import AceEditor from "react-ace";
import gql from 'graphql-tag';
import { trim, forIn, split, join, first, last, slice, toArray } from 'lodash';

import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/theme-monokai";

import './App.css';

const sampleSchema = `type Starship {
  id: String!
  name: String!
  owner: Person
}

type Person {
  id: String!
  firstName: String
  lastName: String
}
`;

const middleLinesAreValid = middleLines => {
  const lines = toArray(middleLines);
  if (lines.length === 0) return false;
  const errors = [];
  lines.forEach(l => {
    const line = trim(l)
    const match = line.match(/[a-z|A-Z]+: [a-z|A-Z]+!?/); // 
    if (match === null) {
      console.log('errored line', line)
      errors.push(line);
    }
    const splitLine = split(line, ':')
    if (splitLine.length !== 2) {
      console.log('errored line', line)
      errors.push(line);
    }
  });
  return errors.length === 0;
}

function App() {

  const [schema, setSchema] = useState(sampleSchema)

  const lines = schema.split('\n')

  let types = {};
  let currentType = '';
  let validSchema = '';
  lines.forEach(l => {
    const line = trim(l);
    // console.log('line', line);
    if (line.substr(0, 4) === 'type') {
      currentType = line.split(' ')[1];
      // console.log('currentType', currentType);
      types[currentType] = []
    }
    if (l !== '') {
      types[currentType].push(l)
    }
  });

  forIn(types, (lines, typeName) => {
    if (lines.length <= 2) return;
    const firstLine = first(lines);
    const lastLine = last(lines);
    const middleLines = slice(lines, 1, lines.length - 1);
    const isFirstLineValid = firstLine.match(/type [a-z|A-Z]+ {/) !== null;
    if (!isFirstLineValid) {
      console.log('isFirstLineValid false')
      return;
    }
    const isLastLineValid = lastLine === '}';
    if (!isLastLineValid) return;
    const areMiddleLinesValid = middleLinesAreValid(middleLines);
    if (!areMiddleLinesValid) {
      console.log('areMiddleLinesValid', areMiddleLinesValid)
      return;
    }
    const typeSchema = join(lines, '\n');

    validSchema += `\n${typeSchema}\n`;
  })

  console.log('validSchema', validSchema);

  // console.log('types', types);

  // console.log(schema.match(/(type [a-z|A-Z]+) \{([^}]+)\}/))

  const graphql = gql(validSchema)
  const { definitions } = graphql
  return (
    <div className="App">
      <h1>Steve Jen</h1>
      <h2>Let Steve <em>Jen</em>erate Your Code</h2>
      <ul>
        { definitions && definitions.map(def => {
          const {
            name,
            fields
          } = def
          const parameters = []
          fields.forEach(field => parameters.push(field.name.value))
          return (<li>{name.value}: ({parameters.join(' | ')})</li>)
        }) }
      </ul>
      <AceEditor
        mode="javascript"
        theme="monokai"
        defaultValue={schema}
        value={schema}
        onChange={setSchema}
        name="schema-editor"
        editorProps={{ $blockScrolling: true }}
        fontSize={14}
        setOptions={{
          enableBasicAutocompletion: true,
          enableLiveAutocompletion: true,
          enableSnippets: false,
          showLineNumbers: true,
          tabSize: 2,
        }}
      />
      
    </div>
  );
}

export default App;
