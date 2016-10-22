'use strict'

module.exports = NodePool


/*
 * 
 *      Super simple object pool that tracks usage by duration
 *      Note that times and durations are in seconds.
 * 
*/


function NodePool(definition) {

    var pool = []
    var inUseUntil = []


    this.getFor = function (duration) {
        var now = performance.now() / 1000
        var i, node

        // choose anything not in use
        for (i = 0; i < inUseUntil.length; i++) {
            if (inUseUntil[i] < now) node = pool[i]
            if (node) break
        }
        // allocate new node
        if (!node) {
            i = pool.length
            pool.push(definition.create())
            node = pool[i]
        }

        // mark as in use, clean up and return
        inUseUntil[i] = now + duration + 0.3
        return node
    }


    this.free = function () {
        // free up to one node that hasn't been used in 5 seconds
        var limit = performance.now() / 1000 - 5
        for (var i = 0; i < inUseUntil.length; i++) {
            if (inUseUntil[i] < limit) {
                definition.dispose(pool[i])
                pool.splice(i, 1)
                inUseUntil.splice(i, 1)
                return
            }
        }
    }

    // occasionally call free even without outside input
    var interval = 5000 + Math.random() * 1000
    setInterval(this.free, interval)

    this._getSize = function () {
        return pool.length
    }

}


