# BLACKCELL.js

Modern, JS-friendly API for real-time 3D-rendering over [WebGL](http://www.khronos.org/registry/webgl/specs/latest/1.0/).

[API documentation](http://blackcelljs.com/api/B.html) | [Guide](http://blackcelljs.com/guide.html) | [Samples](http://blackcelljs.com/) | [Contributing](CONTRIBUTING.md)  | [Developer guide](https://github.com/vsergey3d/blackcell/wiki/Developer-guide)  | [FAQ](http://stackoverflow.com/questions/tagged/blackcell)

[![Build Status](https://travis-ci.org/vsergey3d/blackcell.svg?branch=master)](https://travis-ci.org/vsergey3d/blackcell)
[![Coverage Status](https://img.shields.io/coveralls/vsergey3d/blackcell.svg)](https://coveralls.io/r/vsergey3d/blackcell?branch=master)

## Features

- Linear algebra (vectors, rotations, transformations) and geometry primitives
- Staging graphics core (designed for custom rendering pipelines and shaders)
- Common implementations (frustum culling, attributes & uniforms binding, context lost handling)
- [WebGL Extensions](http://www.khronos.org/registry/webgl/extensions/) supported / [WebGL 2.0](http://www.khronos.org/registry/webgl/specs/latest/2.0/) oriented

## Download

The current version is `v.0.0.1`

- Download [minified](http://blackcelljs.com/b.min.zip) library ([source map](http://blackcelljs.com/b.map.zip))
- Download [debug](http://blackcelljs.com/b.zip) library

## Licensing

BLACKCELL is licensed under the [MIT license](LICENSE.md).

## Example

```javascript
var M = B.Math, R = B.Render,
    dev = R.makeDevice(canvas);

dev.stage("main").output(dev.target()).
    view(M.makeMatrix4().lookAt(M.makeVector3(0,1,-1), M.Vector3.ZERO, M.Vector3.Y)).
    proj(M.makeMatrix4().perspective(Math.PI / 3, canvas.width / canvas.height, 0.1, 1000)).
    uniform("mxVP", R.Stage.VIEW_PROJ);

dev.material("default").
    pass("main", dev.makePass(
        "attribute vec3 position;" +
        "uniform mat4 mxT;" +
        "uniform mat4 mxVP;" +
        "void main() { gl_Position = mxVP * mxT * vec4(position, 1.0); }",
        "void main() { gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0); }"));

dev.instance("default",
    dev.makeMesh().
        attribute("position", R.Attribute.POSITION).
        vertices([-1,0,-1, -1,0,1, 1,0,1, 1,0,-1, 0,1,0]).
        indices([0,1, 1,2, 2,3, 3,0, 0,4, 1,4, 2,4, 3,4]).
        primitive(R.Primitive.LINE),
    M.makeMatrix4().scale(0.3, 0.4, 0.3)
).
    uniform("mxT", R.Instance.TRANSFORM);

dev.frame();
```
