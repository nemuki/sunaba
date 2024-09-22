package dev.nemuki

import dev.nemuki.infra.repository.mapper.sandbox.QueriesImpl
import java.sql.DriverManager

fun main() {
    println("Hello World!")

    val connection = DriverManager.getConnection(
        "jdbc:postgresql://localhost:5432/sunaba",
        "sunaba",
        "password",
    )

    try {
        val queries = QueriesImpl(connection)
        val data = queries.listSandboxData()

        println("Sandbox data:")
        data.forEach {
            println(it)
        }

        val dataById = queries.getSandboxDataById(1)

        println("Sandbox data by id:")
        println(dataById)
    } catch (e: Exception) {
        println("Failed to set autocommit to false")
        e.printStackTrace()
    } finally {
        connection.close()
    }
}
