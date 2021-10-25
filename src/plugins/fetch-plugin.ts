import * as esbuild from 'esbuild-wasm'
import axios from 'axios';
import localForage from 'localforage';

const fileCache = localForage.createInstance({
  name: 'filecache',
});

export const fetchPlugin = (initialCode: string) => {
  return {
    name: 'fetch-plugin',
    setup(build: esbuild.PluginBuild) {

      build.onLoad({ filter: /(^index\.js$)/ }, () => {
        return {
          loader: 'jsx',
          contents: initialCode,
        };
      });

    build.onLoad({ filter: /.*/ } , async (args: any) => {
      console.log('args', args);

      const cachedResult = await fileCache.getItem<esbuild.OnLoadResult>(args.path);
      if (cachedResult) {
        return cachedResult;
      }

      return null;
    });

      build.onLoad({ filter: /\.css$/ }, async (args: any) => {

        const { data, request } = await axios.get<string>(args.path);

        const escaped = data.replace(/\n/g, '').replace(/"/g, '\\"').replace(/'/g, "\\'");


        return {
          loader: 'jsx',
          contents: `
          const style = document.createElement('style');
          style.innerText = '${escaped}';
          document.head.appendChild(style);
          `,
          resolveDir: new URL('./', request.responseURL).pathname,
        }
      });

      build.onLoad({ filter: /.*/ }, async (args: any) => {  
  
          const { data, request } = await axios.get<string>(args.path);
          
          console.log(args.path);

          const contents = data;
  
          const result: esbuild.OnLoadResult = {
              loader: 'jsx',
              contents,
              resolveDir: new URL('./', request.responseURL).pathname,
          };
  
          await fileCache.setItem(args.path, result);
  
          return result;
      });

    }
  }
}