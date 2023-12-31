// Count the number of set bits in an integer
self.popcount = function(x) {
    x -= (x >> 1) & 0x55555555;
    x = (x & 0x33333333) + ((x >> 2) & 0x33333333);
    x = (x + (x >> 4)) & 0x0f0f0f0f;
    x += x >> 8;
    x += x >> 16;
    return x & 0x0000003f;
}

// Count the number of trailing zeros in an integer
self.ctz  = function(x) {
    return popcount((x & -x) - 1);
}

// Computes the bitmask with all values set
self.allValues = function(size) {
	return (1 << size) - 1;
}

// Computes the bitmask with a specific value set
self.valueBit = function(value) {
	return 1 << (value - 1);
}

// Get the value of the first set bit
self.minValue = function(bits) {
	return ctz(bits) + 1;
}

// Get the value of the last set bit
self.maxValue = function(bits) {
	return 32 - Math.clz32(bits);
}

// Get if a value is set
self.hasValue = function(bits, value) {
	return (bits & valueBit(value)) !== 0;
}

// Get the value of a randomly set bit
self.randomValue = function(bits) {
	if (bits === 0) {
		return 0;
	}

	const numValues = popcount(bits);
	let valueIndex = Math.floor(Math.random() * numValues);
	let curBits = bits;
	while (curBits !== 0) {
		const value = minValue(curBits);
		if (valueIndex === 0) {
			return value;
		}
		curBits ^= valueBit(value);
		valueIndex--;
	}
	return 0;
}

self.valuesMask = function(values) {
	return values.reduce((mask, value) => mask | valueBit(value), 0);
}

self.valuesList = function(mask) {
	const values = [];
	while (mask !== 0) {
		const value = minValue(mask);
		values.push(value);
		mask ^= valueBit(value);
	}
	return values;
}

self.binomialCoefficient = function(n, k) {
	if (k < 0 || k > n) {
		return 0;
	}

	if (k === 0 || k === n) {
		return 1;
	}

	k = Math.min(k, n - k);

	let result = 1;
	for (let i = 0; i < k; i++) {
		result *= n - i;
		result /= i + 1;
	}

	return result;
}

self.combinations = function* (array, size) {
    function* combine(start, prefix) {
        if (prefix.length === size) {
            yield prefix;
        } else {
            for (let i = start; i < array.length; i++) {
                yield* combine(i + 1, [...prefix, array[i]]);
            }
        }
    }
    yield* combine(0, []);
};

self.permutations = function* (array) {
    function* permute(list, i) {
        if (i + 1 === list.length) {
            yield list;
        } else {
            for (let j = i; j < list.length; j++) {
                [list[i], list[j]] = [list[j], list[i]];
                yield* permute(Array.from(list), i + 1);
                [list[i], list[j]] = [list[j], list[i]];
            }
        }
    }
    yield* permute(Array.from(array), 0);
};

// Helper for memo keys
self.cellsKey = function(prefix, cells, size) {
	return prefix + appendCellNames(cells, size);
}

self.appendInts = function(ints) {
	return ints.map(i => '|' + i).join('');
}

self.appendCellNames = function(cells, size) {
	return cells.map(cell => '|' + cellName(cell, size)).join('');
}

self.maskToString = function(mask, size) {
	return valuesList(mask).join(size >= 10 ? ',' : '');
}

self.appendCellValueKey = function(board, cells) {
	let builder = '';
	cells.forEach(cellIndex => {
		const mask = board.cells[cellIndex];
		builder += (board.isGivenMask(mask) ? '|s' : '|') + (mask & ~board.givenBit).toString(16);
	});
	return builder;
}

self.cellName = function (cellIndex, size) {
    const row = Math.floor(cellIndex / size);
    const col = cellIndex % size;
    return `R${row + 1}C${col + 1}`;
};

self.cellIndexFromName = function(name, size) {
	const regex = /r(\d+)c(\d+)/;
	const match = regex.exec(name.toLowerCase());
	if (!match) {
		throw new Error(`Invalid cell name: ${name}`);
	}

	const row = parseInt(match[1]) - 1;
	const col = parseInt(match[2]) - 1;
	return row * size + col;
}

self.sequenceEqual = function(arr1, arr2) {
    if (arr1.length !== arr2.length) {
        return false;
    }

    return arr1.every((value, index) => value === arr2[index]);
}

// Assumes arr is sorted
self.removeDuplicates = function(arr) {
    if (!arr.length) {
        return arr;
    }
    let j = 0;
    for (let i = 1; i < arr.length; i++) {
        if (arr[i] !== arr[j]) {
            j++;
            arr[j] = arr[i];
        }
    }
    return arr.slice(0, j + 1);
}
