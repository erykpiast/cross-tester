import Promise from 'bluebird';
import { readdirSync } from 'fs';
import browserify from 'browserify';
import babelify from 'babelify';
import minifyify from 'minifyify';
import each from 'lodash.foreach';


export function get() {
    return Promise.all(
        readdirSync(__dirname).filter((file) => file !== 'index.js').map((name) =>
            new Promise((resolve, reject) => {
                browserify('./index.js', {
                    debug: true,
                    basedir: `${__dirname}/${name}`
                })
                .transform(babelify.configure({
                    only: /^(?!.*node_modules)+.+\.js$/,
                    sourceMaps: false
                }))
                .plugin(minifyify, { map: false })
                .bundle((err, code) => {
                    if(err) {
                        reject(err);
                    } else {
                        resolve({
                            name: name,
                            code: code.toString()
                        });
                    }
                });
            })
        )
    ).then((testCases) => {
        let hash = { };
        
        each(testCases, ({ name, code }) => {
           hash[name] = `setTimeout(function(){${code};}, 0);`; 
        });
        
        return hash;
    });
}