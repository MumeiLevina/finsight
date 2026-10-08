import {describe,expect,it} from 'vitest';
import {json,monthRange} from './lib.js';
describe('monthly finance helpers',()=>{
 it('creates an exact UTC month range',()=>{const r=monthRange('2026-02');expect(r.start.toISOString()).toBe('2026-02-01T00:00:00.000Z');expect(r.end.toISOString()).toBe('2026-03-01T00:00:00.000Z')});
 it('serializes precise bigint values',()=>expect(json({amount:9007199254740993n})).toEqual({amount:'9007199254740993'}));
 it('rejects malformed months',()=>expect(()=>monthRange('02-2026')).toThrow());
});
