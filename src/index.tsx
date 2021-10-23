import * as esbuild from 'esbuild-wasm';
import ReactDom from 'react-dom';
import { useState, useEffect, useRef } from 'react';
import { unpkgPathPlugin } from './plugins/unpkg-path-plugin';



const App = () => {

    const [input, setInput] = useState('');
    const [code, setCode] = useState('');
    const serviceRef = useRef<any>();

    const startService = async () => {
        serviceRef.current = await esbuild.startService({
            worker: true,
            wasmURL: '/esbuild.wasm',
        });
    }

    useEffect(() => {
        startService();
    }, []);

    const onInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInput(event.target.value)
    }

    const onClick = async () => {
        console.log(input);
        if (!serviceRef.current) return;

        console.log(serviceRef.current);

        const result = await serviceRef.current.build({
            entryPoints: ['index.js'],
            bundle: true,
            write: false,
            plugins: [unpkgPathPlugin()],
        })
        console.log(result);
        setCode(result.outputFiles[0].text);
    }

    return <div>
        <textarea onChange={onInputChange} value={input}></textarea>
        <div>
            <button onClick={onClick}>Submit</button>
        </div>
        <pre>{code}</pre>
    </div>
}

ReactDom.render(<App />, document.querySelector('#root'));
