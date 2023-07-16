import { Vertex, Face, Halfedge } from "./structures";

export function generateHalfedges(vertices, indices, faces) {
    var vertex_indexed_array = [];
    var edge_list = [];
    var edges = [];

    for (var i = 0, j = 0; i < faces.length; i++, j += 3) {
        var face = new Face(faces[i]);

        for (var k = 0, u = 1; k < 3; k++, u++) {
            if (u == 3) {
                u = 0;
            }

            var init_vertex = vertices[indices[j + k]].position.slice();
            var end_vertex = vertices[indices[j + u]].position.slice();

            vertex_indexed_array[[init_vertex, end_vertex]] = [indices[j + k], indices[j + u]];
            edges[[indices[j + k], indices[j + u]]] = new Halfedge();
            edges[[indices[j + k], indices[j + u]]].face = face;
            edges[[indices[j + k], indices[j + u]]].vertex = vertices[indices[j + k]];
            edges[[indices[j + k], indices[j + u]]].index = [indices[j + k], indices[j + u]];
            vertices[indices[j + k]].edge = edges[[indices[j + k], indices[j + u]]];
        }

        edges[[indices[j], indices[j + 1]]].next = edges[[indices[j + 1], indices[j + 2]]];
        edges[[indices[j + 1], indices[j + 2]]].next = edges[[indices[j + 2], indices[j]]];
        edges[[indices[j + 2], indices[j]]].next = edges[[indices[j], indices[j + 1]]];

        for (var k = 0, u = 1; k < 3; k++, u++) {
            if (u == 3) {
                u = 0;
            }

            var init_vertex2 = vertices[indices[j + k]].position.slice();
            var end_vertex2 = vertices[indices[j + u]].position.slice();

            var init_array2 = [init_vertex2];
            var end_array2 = [end_vertex2];
            var index_in_edges = vertex_indexed_array[[end_array2, init_array2]];

            if (vertex_indexed_array[[end_array2, init_array2]]) {
                edges[[indices[j + k], indices[j + u]]].opposite = edges[index_in_edges];
                edges[index_in_edges].opposite = edges[[indices[j + k], indices[j + u]]];
                edge_list[[indices[j + k], indices[j + u]]] = [end_array2, init_array2];
            }
        }
    }

    for (var i = 0, j = 0; i < faces.length; i++, j += 3) {
        var face = new Face();

        for (var k = 0, u = 1; k < 3; k++, u++) {
            if (u == 3) {
                u = 0;
            }

            var init_vertex2 = vertices[indices[j + k]].position.slice();
            var end_vertex2 = vertices[indices[j + u]].position.slice();

            var init_array2 = [init_vertex2];
            var end_array2 = [end_vertex2];
            var index_in_edges = vertex_indexed_array[[end_vertex, init_vertex]];

            if (!vertex_indexed_array[[end_array2, init_array2]]) {
                // vertex_indexed_array[[end_array2, init_array2]] = [indices[j + u], indices[j + k]];
                edges[[indices[j + u], indices[j + k]]] = new Halfedge();
                edges[[indices[j + u], indices[j + k]]].face = null;
                edges[[indices[j + u], indices[j + k]]].vertex = vertices[indices[j + u]];
                edges[[indices[j + u], indices[j + k]]].index = [indices[j + u], indices[j + k]];
                vertices[indices[j + u]].half_edge = edges[[indices[j + u], indices[j + k]]];
                
                edges[[indices[j + k], indices[j + u]]].opposite = edges[[indices[j + u], indices[j + k]]];
                edges[[indices[j + u], indices[j + k]]].opposite = edges[[indices[j + k], indices[j + u]]];
            }
        }
    }

    for (var i = 0, j = 0; i < faces.length; i++, j += 3) {
        var face = new Face();

        for (var k = 0, u = 1; k < 3; k++, u++) {
            if (u == 3) {
                u = 0;
            }

            var init_vertex2 = vertices[indices[j + k]].position.slice();
            var end_vertex2 = vertices[indices[j + u]].position.slice();

            var init_array2 = [init_vertex2];
            var end_array2 = [end_vertex2];
            var index_in_edges = vertex_indexed_array[[end_vertex, init_vertex]];

            if (!vertex_indexed_array[[end_array2, init_array2]]) {
                var edge = edges[[indices[j + k], indices[j + u]]];
                var h = edge;

                do {
                    h = h.next.next.opposite;
                } while (h.face);

                edges[[indices[j + u], indices[j + k]]].next = h;
            }
        }
    }
    
    return edges;
}