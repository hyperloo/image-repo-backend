# Image_Repo Backend [link](https://shopify-backend-app.herokuapp.com/api/user)

_NodeJS and Express.js Backend_

An Image Repository Backend with Google OAuth2.0 for Authentication, Bulk Image Uploading, Secure Access and Much more

### <u>Packages and Libraries used Globally</u>

#### a. For building APIs

-   Express

#### b. For Security

-   cors : to allow Cross Origin Resource Sharing
-   helmet : Helmet helps you secure your Express apps by setting various HTTP headers.

#### c. Database

-   sequelize - ORM to connect to MySQL Database
-   redis - To connect to redis Database
-   aws-sdk - to connect to AWS S3

#### d. Authentication

-   cookie-session
-   passport
-   passport-google-oauth20

#### e. Miscellaneous

-   dotenv - to access environment variables

---

## Features

### 1. `Authentication `

This Backend has a `Google OAuth 2.0` based Authentication through which user's profile and EMail Info are fetched and stored in the Users Table.

### 2. `Single Image & Bulk Image Uploads`

Image can be uploaded in two formats:

-   Link Format : User can directly upload the Image links
-   Image Directly : User can upload Images which can be uploaded to Cloud Storage like S3 and like can be stored in Images Table

### 3. `Tags`

Tagging is one of the most important feature of the Backend which enables to categorize & sort Images. User can add images and tag them to different category.

---

## Models

### **Users Model**

```sh
create table users (
	id varchar(40) primary key,
    username varchar(20),
    name varchar(40) not null,
    picture varchar(20000),
    email varchar(40) not null unique,
    language varchar(10) default "en",
    uploads int default 0,
    downloads int default 0,

    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    index idx_username (username)
);
```

### **Images Model**

```sh
create table images(
	id int auto_increment primary key,
    name varchar(100) not null,
    link varchar(20000) not null,
    tagsArray varchar(1000),
	creatorId varchar(40) not null,
    creatorUserName varchar(40) not null,
    isPublic boolean default true,
    downloads int default 0,
    likes int default 0,

    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    index idx_creatorId (creatorId),
    index idx_imageName (name),

    constraint foreign key (creatorId) references users(id)
);
```

### **Tags Model**

```sh
create table tags(
	id int auto_increment primary key,
    name varchar(40) not null,
    numberOfImages int default 1,

    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    unique index idx_tagName (name)
);
```

### **TagMappings Model**

```sh
create table tagMappings(
	id int primary key auto_increment,
    tagName varchar(40) not null,
    imageId int not null,

    constraint foreign key (imageId) references images(id),
    constraint foreign key (tagName) references tags(name),

    index idx_imageId (imageId),
    index idx_tagName (tagName)
);
```

---

## Feature Insights

## `User Logging to the App`

> -   I am using Google OAuth for authentication and Cookies & session for persistance in the backend.
> -   Each request except the Image Fetching one are first checked for authentication using `middleware isAuthenticated`.

`System Design:`

-   If user is authenticated, then add the details to DB and create a session.
-   Otherwise, fetch the user from User Database and create a session from that.

### `Authentication APIs`

```sh
    API: /auth/login
    Method: Get
    Description: For initializing Google OAuth2.0
```

```sh
    API: /auth/google/callback
    Method: Get
    Description: Callback method from the Google OAuth2.0
```

```sh
    API: /auth/success
    Method: Get
    Description: Successful Login route which sends back user to frontend
```

```sh
    API: /auth/failure
    Method: Get
    Description: On Authentication Failure
    Response:
    {
        status: 400,
        msg: "Authorization Error! Cannot Login.
    }
```

```sh
    API: /auth/logout
    Method: Get
    Description: User Session Logout
    Response:
    {
        status: 400,
        msg: "Logout Successful!
    }
```

---

## `Username Management`

> -   Users have to choose their `username` which are unique for each user. It is like a `pen name` for each user.
> -   The first time logged in users are asked and is mandatory to add a username.
> -   There must be a `fast and robust username checking` which are available.

`System Design:`

-   **Using DB** : Accessing user from DB. <br>
    Cons of directly accessing it from DBMS
    -   Accessing and checking the usernames from DBMS will be slow relatively.
    -   Connecting to the DBMS and fetching info is slow
-   **Using Redis** : Accessing the used username from Redis. <br>
    Pros for using Redis
    -   Accessing Redis is much faster is it is `in-memory DB`.
    -   Once the User takes an username, the entry for the username is marked as true.
    -   Once user enters new username, API `/user/check` is called and in the route, the username is checked, if username exists, then err msg i"s send otherwise valid response is sent back.

### `User APIs`

```sh
    API: /user
    Method: Get
    Description: Get the logged in user
    Response:
    {
        status: 200,
        data: {
            id: google-id,
            username: user1,
            name: name-of-user,
            picture: link-to-user-image,
            email: user-email,
            language: en,
            uploads: 10,
            downloads: 0,
            createdAt: 2021-09-17T17:24:13.000Z,
            updatedAt: 2021-09-18T15:15:22.000Z
        }
    }
```

```sh
    API: /user/check?username=<typed-username>
    Method: Get
    Description: Check if username is already taken or not
    Responses:
    - User not logged in : {
        status: 401,
        msg: "User not Authenticated!"
    }
    - User already have a username : {
        status: 401,
        msg: "You already have a username  + <username-of-user> + !"
    }
    - Username is not taken : {
        status: 200,
        msg: "Valid Username!"
    }
```

```sh
    API: /user/patch?username=<username>
    Method: Patch
    Description: Update the username
    Responses:
    - User not logged in : {
        status: 401,
        msg: "User not Authenticated!"
    }
    - User already have a username : {
        status: 401,
        msg: "You already have a username  + <username-of-user> + !"
    }
    - Username is not taken : {
        status: 200,
        msg: "Username Updation successful!",
        data: {
            id: google-id,
            username: user1,
            name: name-of-user,
            picture: link-to-user-image,
            email: user-email,
            language: en,
            uploads: 10,
            downloads: 0,
            createdAt: 2021-09-17T17:24:13.000Z,
            updatedAt: 2021-09-18T15:15:22.000Z
        }
    }
```

---

## `Image Management`

> -   Get All the Images
> -   APIs return recent to oldest images.
> -   `Different types of APIs`
> -   On each upload, the number of Image uploads by that user and the associated tag image count increases by 1
> -   **User Account Images** : User specific Images that are created by user.
> -   **Images having Tags** : Images having given tags
> -   **Get Image** : Access Protected Image management
> -   **Image Reaction** : One can like or dislike the image
> -   **Creation**
>     -   User can upload Images, Bulk Images or image links.
>     -   Image Creation can be done only if user is logged in.
>     -   <u>Naming</u>: <br>

            - User can give `name to image` or `random name` is assigned to image with prefix as `Image_`. <br>
            - In case of Bulk images, a bulk image prefix f given, if any image do not have a name, then that prefix is used along with random string

> -   **Pagination**
>     -   Every Image API have pagination enabled using `page` & `limit`.
> -   **Private Access**
>     -   User can set Image as `Private`.
>     -   Bulk images have an option of making images all images private or each image can choose it's visibility on its own.
>     -   User that are `private` can be `accessed by creator` once logged in.
> -   **Tags**
>     -   Copy of Image Tags are stored in image itself for faster retrieval just for showing with an Image, as there will be large number of images and making joins every time will make the request much slower

`System Design:`

-   **Image Access**
    -   Image is Access from Database based on the APIs and Query requirements
-   **Caching**
    -   Caching is implemented using `Redis`.
    -   If the query is done in within 10sec, then the response if handled by Cache is already present.
    -   The Cache for given query expires within 10secs.
    -   Cache makes the App read optimised as the read ratio is much more than the write ratio.
    -   Cache has the `key -> url` of request & `value -> stringified response` from the Database.

### `Image APIs`

```sh
    API: /image/create
    Method: Post
    Description: create an Image
    Body: {
        name: Image-name,
        link: Link-to-image,
        tags: [Array-of-tags]
        isPublic: if-image-public (Default true)
    }
    Response: {
        status: 200,
        msg: "Image created successfully!",
        data: {
            id: 47,
            name: Imagewithname,
            link: https://eversql.com/webassets/images/fix_100_percent_high_cpu_usage_eversql.gif,
            tagsArray: bulk|return|finall|bulkone,
            creatorId: creator-id,
            creatorUserName: user-name,
            isPublic: true,
            downloads: 0,
            likes: 0,
            createdAt: 2021-09-19T15:40:04.000Z,
            updatedAt: 2021-09-19T15:40:04.000Z
        }
    }
```

```sh
    API: /image/create/bulk
    Method: Post
    Description: create bulk Images
    Body: {
        globalTags: ["tags","applied","to-all-images"],
        globalName: global-image-prefix,
        uploads:[{
            name: Image-name,
            link: Link-to-image,
            tags: [Array-of-tags]
            isPublic: if-image-public (Default true)
        },{
            name: Image-name,
            link: Link-to-image,
            tags: [Array-of-tags]
            isPublic: if-image-public (Default true)
        }]
    }
    Response: {
        status: 200,
        msg: "Images created successfully!",
        data: [{
            id: 47,
            name: GLobal-prefix-randomId,
            link: link-to-image,
            tagsArray: global-tags|bulk|return|finall|bulkone,
            creatorId: creator-id,
            creatorUserName: user-name,
            isPublic: true,
            downloads: 0,
            likes: 0,
            createdAt: 2021-09-19T15:40:04.000Z,
            updatedAt: 2021-09-19T15:40:04.000Z
        },{
            id: 48,
            name: Imagewithname,
            link: link-to-image,
            tagsArray: global-tags|bulk|return|finall|bulkone,
            creatorId: creator-id,
            creatorUserName: user-name,
            isPublic: true,
            downloads: 0,
            likes: 0,
            createdAt: 2021-09-19T15:40:04.000Z,
            updatedAt: 2021-09-19T15:40:04.000Z
        }]
    }
```

```sh
    API: /image?tags=image,one&details=true&page=1&limit=2
    Method: Get
    Description: Get all the images with given tag names
    Response:
    - Details query not provided: {
        status: 200,
        data: [
            {
                id: 20,
                name: Imagenull,
                link: link-to-image,
                tagsArray: null,
                creatorId: creator-id,
                creatorUserName: user3,
                isPublic: true,
                downloads: 0,
                likes: 0,
                createdAt: 2021-09-17T17:31:33.000Z,
                updatedAt: 2021-09-17T17:31:33.000Z
            },
            {
                id: 21,
                name: Imagenull,
                link: link-to-image,
                tagsArray: null,
                creatorId: creator-id,
                creatorUserName: user3,
                isPublic: true,
                downloads: 0,
                likes: 0,
                createdAt: 2021-09-17T17:32:02.000Z,
                updatedAt: 2021-09-17T17:32:02.000Z
            }]
        }
    - Details === true : {
        status: 200,
        data: {
            images: [
                {
                    id: 20,
                    name: Imagenull,
                    link: link-to-image,
                    tagsArray: null,
                    creatorId: creator-id,
                    creatorUserName: user3,
                    isPublic: true,
                    downloads: 0,
                    likes: 0,
                    createdAt: 2021-09-17T17:31:33.000Z,
                    updatedAt: 2021-09-17T17:31:33.000Z
                },
                {
                    id: 21,
                    name: Imagenull,
                    link: link-to-image,
                    tagsArray: null,
                    creatorId: creator-id,
                    creatorUserName: user3,
                    isPublic: true,
                    downloads: 0,
                    likes: 0,
                    createdAt: 2021-09-17T17:32:02.000Z,
                    updatedAt: 2021-09-17T17:32:02.000Z
                }
            ],
            tags: [
                {
                    id: 7,
                    name: Image,
                    numberOfImages: 15,
                    createdAt: 2021-09-17T17:31:34.000Z,
                    updatedAt: 2021-09-18T15:15:22.000Z
                },
                {
                    id: 8,
                    name: one,
                    numberOfImages: 1,
                    createdAt: 2021-09-17T17:31:34.000Z,
                    updatedAt: 2021-09-17T17:31:34.000Z
                }
            ]
        }
    }

```

```sh
    API: /image/all?page=1&limit=2
    Method: Get
    Description: Get all the images
    Response: {
        status: 200,
        data: [
            {
                id: 20,
                name: Imagenull,
                link: link-to-image,
                tagsArray: null,
                creatorId: creator-id,
                creatorUserName: user3,
                isPublic: true,
                downloads: 0,
                likes: 0,
                createdAt: 2021-09-17T17:31:33.000Z,
                updatedAt: 2021-09-17T17:31:33.000Z
            },
            {
                id: 21,
                name: Imagenull,
                link: link-to-image,
                tagsArray: null,
                creatorId: creator-id,
                creatorUserName: user3,
                isPublic: true,
                downloads: 0,
                likes: 0,
                createdAt: 2021-09-17T17:32:02.000Z,
                updatedAt: 2021-09-17T17:32:02.000Z
            }]
        }
```

```sh
    API: /image/all/<user-id>?page=1&limit=2
    Method: Get
    Description: Get all the images for the user
    Response: {
        status: 200,
        data: [
            {
                id: 25,
                name: Image_xj4bfw7mw,
                link: image-link,
                tagsArray: null,
                creatorId: user-id,
                creatorUserName: user3,
                isPublic: true,
                downloads: 0,
                likes: 0,
                createdAt: 2021-09-18T06:13:55.000Z,
                updatedAt: 2021-09-18T06:13:55.000Z
            },
            {
                id: 24,
                name: ,
                link: image-link,
                tagsArray: null,
                creatorId: user-id,
                creatorUserName: user3,
                isPublic: true,
                downloads: 0,
                likes: 0,
                createdAt: 2021-09-18T06:12:11.000Z,
                updatedAt: 2021-09-18T06:12:11.000Z
            }
        ]
    }
```

```sh
    API: /image/multi?id=24,25 or /image/multi?name=image1,image2
    Method: Get
    Description: Get the images with given ids or image name
    Response: {
        status: 200,
        data: [
            {
                id: 25,
                name: Image_xj4bfw7mw,
                link: image-link,
                tagsArray: null,
                creatorId: user-id,
                creatorUserName: user3,
                isPublic: true,
                downloads: 0,
                likes: 0,
                createdAt: 2021-09-18T06:13:55.000Z,
                updatedAt: 2021-09-18T06:13:55.000Z
            },
            {
                id: 24,
                name: ,
                link: image-link,
                tagsArray: null,
                creatorId: user-id,
                creatorUserName: user3,
                isPublic: true,
                downloads: 0,
                likes: 0,
                createdAt: 2021-09-18T06:12:11.000Z,
                updatedAt: 2021-09-18T06:12:11.000Z
            }
        ]
    }
```

```sh
    API: /image/single?id=24
    Method: Get
    Description: Get the images view with given id
    Response:
    - if Image is public or user is the creator : <img src="${images[0].link}" alt="${images[0].name}" />
    - if image is private : {
        status: 400,
        msg: "You are not authorized to access the image"
    }
```

```sh
    API: /image/react
    Method: Patch
    Description: react on the image with given id and like as +1 or -1
    Body : {
        id:24,
        like:1
    }
    Response: {
        status: 200,
        msg: "Image reaction successful!"
    }
```

## `Tag Management`

> -   Manages all the tags that are added to any image
> -   Each image has a `name` and `number of Images`
> -   Name of each tag is unique

`System Design:`

-   **Creation** : If image's tag is new, then it is added as new entry to tags table, else the numberOfImages for that tag is incremented
-   **Association With the Image** <br>
    -   **Image Tag Mapping** : For each tag, a new Image to Tag mapping is created.
    -   This mapping is used for tag based searching in which tag name act as foreign key to the tag and imageId is the foreign key to the image

### `Tag APIs`

```sh
    API: /tag/all?page=1&limit=2
    Method: Get
    Description: Get all the tags
    Response:{
        status: 200,
        data: [
            {
                id: 7,
                name: Image,
                numberOfImages: 15,
                createdAt: 2021-09-17T17:31:34.000Z,
                updatedAt: 2021-09-18T15:15:22.000Z
            },
            {
                id: 12,
                name: name,
                numberOfImages: 10,
                createdAt: 2021-09-18T06:12:14.000Z,
                updatedAt: 2021-09-18T07:42:22.000Z
            }
        ]
    }
```

```sh
    API: /tag?id=7,12
    Method: Get
    Description: Get the tags with given Ids
    Response:{
        status: 200,
        data: [
            {
                id: 7,
                name: Image,
                numberOfImages: 15,
                createdAt: 2021-09-17T17:31:34.000Z,
                updatedAt: 2021-09-18T15:15:22.000Z
            },
            {
                id: 12,
                name: name,
                numberOfImages: 10,
                createdAt: 2021-09-18T06:12:14.000Z,
                updatedAt: 2021-09-18T07:42:22.000Z
            }
        ]
    }
```

## Uploads to AWS Management

> -   Images are uploaded to AWS S3 from where the links to image are fetched

`System Design:`

> -   The images are uploaded using Signed Url with `putObject` which is a more secure way of uploading as the whole process is handled by backend.
> -   This signed URL is sent back to frontend which then uploads image to it.
> -   Then, frontend get a `getObject` signed Url with the key that through which the image is uploaded
> -   This link is then sent as the link to image in the request body while inserting image

### `Tag APIs`

```sh
    API: /aws/put-signed-url?uploads=2 (default 1)
    Method: Get
    Description: Get an array of putObject type presigned Urls for given number of uploads
    Response:{
        status: 200,
        data: [
            {
                url: presigned-url-1,
                key: "08550cca-ef7f-467b-b751-88d10415cd5f"
            },
            {
                url: presigned-url-2,
                key: "a5e62d88-f89c-490c-9139-2b8830cea398"
            }
        ]
    }
```

```sh
    API: /aws/get-signed-url?key=08550cca-ef7f-467b-b751-88d10415cd5f,a5e62d88-f89c-490c-9139-2b8830cea398
    Method: Get
    Description: Get an array of getObject type presigned Urls with given keys
    Response:{
        status: 200,
        data: [
                {
                ur:pre-signed-url-get-1,
                ke: "08550cca-ef7f-467b-b751-88d10415cd5f"
                },
                {
                    url: pre-signed-url-get-2,
                    key: "a5e62d88-f89c-490c-9139-2b8830cea398"
                }
            ]
        }
```
