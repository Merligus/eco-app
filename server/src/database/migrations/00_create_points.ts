import { Knex } from 'knex';

export async function up(knex: Knex) {
    return knex.schema.createTable("points", table => {
        table.increments("id").primary();
        table.string("image", 100).notNullable();
        table.string("name", 100).notNullable();
        table.string("email", 100).notNullable();
        table.string("whatsapp", 100).notNullable();
        table.string("latitude", 100).notNullable();
        table.string("longitude", 100).notNullable();
        table.string("city", 100).notNullable();
        table.string("uf", 2).notNullable();
    });
}

export async function down(knex: Knex) {
    return knex.schema.dropTable("points");
}