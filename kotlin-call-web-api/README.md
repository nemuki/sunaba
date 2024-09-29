# kotlin-call-web-api

Kotlin で Web API を呼び出すサンプル<br/>
以下のライブラリを使って、Web API を呼び出すサンプルを作成しています

- Java HTTP Client
- Ktor Client
- okhttp

## Java HTTP Client

Java 11 以降であれば、標準ライブラリの `java.net.http.HttpClient` を使って簡単に Web API を呼び出すことができる

- https://qiita.com/gitcho/items/71b2b2f66356c6de2502

```kotlin
import java.net.URI
import java.net.http.HttpClient
import java.net.http.HttpRequest
import java.net.http.HttpResponse

fun main() {
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
}
```

## Ktor Client

Kotlin で Web API を呼び出すためのライブラリとして、Ktor がある<br/>
Ktor は、Kotlin で Web アプリケーションを作成するためのライブラリで、その一部として HTTP クライアントが提供されている

- https://ktor.io/docs/client-dependencies.html
- https://ktor.io/docs/client-create-and-configure.html
- https://ktor.io/docs/client-requests.html
- https://ktor.io/docs/client-responses.html#json
- https://ktor.io/docs/client-serialization.html#receive_send_data
- https://github.com/Kotlin/kotlinx.serialization
- https://github.com/Kotlin/kotlinx.coroutines

```kotlin
import dev.nemuki.entity.JsonPlaceholder
import io.ktor.client.call.body
import io.ktor.client.plugins.contentnegotiation.ContentNegotiation
import io.ktor.client.request.get
import io.ktor.client.HttpClient
import io.ktor.http.URLProtocol
import io.ktor.http.encodedPath
import io.ktor.serialization.kotlinx.json.json
import kotlinx.coroutines.runBlocking

fun main() {
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
}
```

## okhttp

okhttp は、Android で使われることが多いライブラリですが、Kotlin でも使うことができる

- https://github.com/square/okhttp

```kotlin
import okhttp3.OkHttpClient
import okhttp3.Request

fun main() {
    val okHttpClient = OkHttpClient()

    val request = Request.Builder()
        .url("https://jsonplaceholder.typicode.com/posts")
        .build()

    val response = okHttpClient.newCall(request).execute()

    println(response.body?.string())

    okHttpClient.dispatcher.executorService.shutdown()
}
```
