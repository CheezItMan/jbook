import * as esbuild from 'esbuild-wasm';
import { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { unpkgPathPlugin } from './plugins/unpkg-path-plugin';

const App = () => {
  const [input, setInput] = useState('');
  const [code, setCode] = useState('');

  const startService = async () => {
    await esbuild.initialize({
      worker: true,
      wasmURL: '/esbuild.wasm',
    });
  };
  
  useEffect(() => {
    startService();
  }, []);

  const onClick = async () => {
    if (!esbuild) {
      console.log('no esbuild');
      return;
    }

    const result = await esbuild.build({
      entryPoints: ['index.js'],
      bundle: true,
      write: false,
      plugins: [unpkgPathPlugin()],
      define: {
        'process.env.NODE_ENV': '"production"',
        global: 'window',
      },
    });

    // console.log(result);

    setCode(result.outputFiles[0].text);
  };

  return (
    <div>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
      ></textarea>
      <div>
        <button onClick={onClick}>Submit</button>
      </div>
      <pre>{code}</pre>
    </div>
  );
};

ReactDOM.render(<App />, document.querySelector('#root'));
