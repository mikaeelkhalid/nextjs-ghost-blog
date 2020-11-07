import Link from 'next/link'
import {useRouter} from 'next/router'
import { type } from 'os'
import styles from '../../styles/Home.module.scss'
import { useState } from 'react'

const {CONTENT_API_KEY, BLOG_URL} = process.env

async function getPosts(slug: string) {
    const res = await fetch(`${BLOG_URL}/ghost/api/v3/content/posts/slug/${slug}?key=${CONTENT_API_KEY}&fields=title,slug,html`)
      .then((res) => res.json())
  
    const posts = res.posts
  
    return posts[0]
  }


  export const getStaticProps = async ({ params }) => {
    const post = await getPosts(params.slug)
    return {
      props: {post},
      revalidate: 10
    }
  }

export const getStaticPaths = () => {
    return {
        paths: [],
        fallback: true
    }
}

type Post = {
    title: string,
    html: string,
    slug: string
}


const Post: React.FC <{post: Post}>= (props) => {

    const { post } = props
    const [enableLoadComments, setEnableLoadComments] = useState<boolean>(true)

    const router = useRouter()
    if (router.isFallback){
        return <h1>Loading..</h1>
    }


function loadsComments (){
        setEnableLoadComments(false)
        ;(window as any).disqus_config = function (){
            this.page.url = window.location.href
            this.page.identifier = post.slug
        }

        const script = document.createElement('script')
        script.src = 'https://my-nextjs-blog.disqus.com/embed.js'
        script.setAttribute('data-timestamp',Date.now().toString())

        document.body.appendChild(script)

    }   

    return (
    <div className={styles.container}>
    
    <h1>{post.title}</h1>  
    <Link href="/"><a>Go Back</a></Link> 
     <div dangerouslySetInnerHTML={{ __html: post.html}}></div>

    {enableLoadComments && (
     <p className={styles.goback} onClick={loadsComments}>
        Load Comments
     </p>)}
     <div id="disqus_thread"></div>
    </div>
    )
}

export default Post