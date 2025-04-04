package dev.nemuki

import dev.nemuki.entity.JsonPlaceholder
import io.ktor.client.call.body
import io.ktor.client.plugins.contentnegotiation.ContentNegotiation
import io.ktor.client.request.get
import io.ktor.http.URLProtocol
import io.ktor.http.encodedPath
import io.ktor.serialization.kotlinx.json.json
import kotlinx.coroutines.runBlocking
import okhttp3.OkHttpClient
import okhttp3.Request
import java.net.URI
import java.net.http.HttpClient
import java.net.http.HttpRequest
import java.net.http.HttpResponse

fun main() {
    println("Hello World!")

    /**
     * Java HttpClient
     */
    println("--- Java HttpClient ---")
    val javaHttpClient = HttpClient.newHttpClient()
    val javaHttpRequest = HttpRequest
        .newBuilder(
            URI.create("https://jsonplaceholder.typicode.com/posts"),
        )
        .build()

    val javaHttpResponse = javaHttpClient.send(
        javaHttpRequest,
        HttpResponse.BodyHandlers.ofString()
    )

    println(javaHttpResponse.body())

    javaHttpClient.close()

    /**
     * Ktor HttpClient
     */
    println("--- Ktor HttpClient ---")
    val ktorClient = io.ktor.client.HttpClient(
        engineFactory = io.ktor.client.engine.java.Java,
    ) {
        install(ContentNegotiation) {
            json()
        }
    }

    val ktorResponse = runBlocking {
        val response = ktorClient.get {
            url {
                protocol = URLProtocol.HTTPS
                host = "jsonplaceholder.typicode.com"
                encodedPath = "/posts"
            }
        }

        val body: List<JsonPlaceholder> = response.body()

        body
    }

    ktorResponse.forEach {
        println("userId: ${it.userId}, id: ${it.id}, title: ${it.title}")
    }

    ktorClient.close()

    /**
     * OkHttp
     */
    println("--- OkHttp ---")
    val okHttpClient = OkHttpClient()

    val request = Request.Builder()
        .url("https://jsonplaceholder.typicode.com/posts")
        .build()

    val response = okHttpClient.newCall(request).execute()

    println(response.body?.string())

    okHttpClient.dispatcher.executorService.shutdown()
}
