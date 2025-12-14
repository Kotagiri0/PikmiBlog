erDiagram

    USERS ||--o{ POSTS : "создаёт"
    USERS ||--o{ COMMENTS : "пишет"
    USERS ||--o{ FAVORITES : "сохраняет"
    USERS ||--o{ LIKES : "лайкает"
    USERS ||--o{ SUBSCRIPTIONS : "подписывается (follower)"
    USERS ||--o{ SUBSCRIPTIONS : "подписки на него (following)"

    POSTS ||--o{ COMMENTS : "имеет"
    POSTS ||--o{ FAVORITES : "входит в"
    POSTS ||--o{ LIKES : "получает"
    POSTS ||--o{ POST_TAGS : "имеет теги"

    TAGS ||--o{ POST_TAGS : "применяется к"

    COMMENTS ||--o{ COMMENTS : "вложенные ответы"

    USERS {
        int id PK
        string username UK
        string email UK
        string password_hash
        string full_name
        text bio
        string avatar_url
        timestamp created_at
        timestamp updated_at
    }

    POSTS {
        int id PK
        string title
        text content
        int author_id FK
        string slug UK
        boolean published
        int views_count
        timestamp created_at
        timestamp updated_at
    }

    TAGS {
        int id PK
        string name UK
        timestamp created_at
    }

    POST_TAGS {
        int post_id FK
        int tag_id FK
    }

    FAVORITES {
        int id PK
        int user_id FK
        int post_id FK
        timestamp created_at
    }

    COMMENTS {
        int id PK
        text content
        int author_id FK
        int post_id FK
        int parent_id FK
        timestamp created_at
        timestamp updated_at
    }

    LIKES {
        int id PK
        int user_id FK
        int post_id FK
        timestamp created_at
    }

    SUBSCRIPTIONS {
        int id PK
        int follower_id FK
        int following_id FK
        timestamp created_at
    }
