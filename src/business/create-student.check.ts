import assert from 'node:assert/strict';
import {CreateStudentAdapter} from './create-student.adapter.js';
import {Context} from '../core/context.js';
import {Student} from '../domain/student.js';

const rows = new Map<string, Student>();
const repo: any = {
    findByMatriculaIncludingDeleted: async (m: string) => [...rows.values()].find((s) => s.matricula === m) ?? null,
    save: async (s: Student) => {
        s.id ??= `id-${rows.size + 1}`;
        rows.set(s.id, s);
        return s;
    },
};
const create = (matricula: string, name = 'Ana', phone = '8499') => {
    const data = Object.assign(new Student(), {name, matricula, phone});
    return new CreateStudentAdapter(repo).execute(new Context(data));
};

const first = await create('123');
assert.equal(first.active, true);
assert.equal(rows.size, 1);

await assert.rejects(() => create('123'), /Já existe um aluno/);

first.active = false;
first.inactivatedAt = first.deletedAt = new Date();
const again = await create('123', 'Ana Souza', '8488');
assert.equal(again.id, first.id);
assert.equal(rows.size, 1);
assert.deepEqual(
    [again.active, again.inactivatedAt, again.deletedAt, again.name, again.phone],
    [true, null, null, 'Ana Souza', '8488'],
);

console.log('create-student: ok');
