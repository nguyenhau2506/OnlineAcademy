import client from "https";
import { parse } from 'node-html-parser';

const CLIENT_SECRET = "BA8Wl5hMvDv20U5VxcbsX1rdUxh3lLzFyAMIKvZzEeW5Pjrp7ISAxJ1ygT20eZQ1fbGxOQDZpbtTaMxBkN86LNE0xrElInlUuP55G5cGMW2Z5sBlp6si0ZTLGaf61x4F"
const CLIENT_ID = "kfoZJMgHKM4RBqOOehit7tMQvvh3IVFqWf8nKwzj"

const headers = {
    "Accept": "application/json, text/plain, */*",
    "Authorization": `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`,
    "Content-Type": "application/json;charset=utf-8"
}

const udemyReq = (url) => {
    return new Promise((resolve,reject) => {
        client.get(url,{
            headers
        }, (res) => {
            let data = '';

            // A chunk of data has been recieved.
            res.on('data', (chunk) => {
                data += chunk;
            });

            // The whole response has been received. Print out the result.
            res.on('end', () => {
                resolve(JSON.parse(data));
            });
        }).on('error',(err) => {
            console.log("Error: " + err.message);
            reject(err);
        });
    })
}

const getPreviewVideo = async (preview_url) => {
    return new Promise((resolve,reject) => {
        client.get(`https://www.udemy.com${preview_url}`,{
            headers
        }, (res) => {
            let data = '';

            // A chunk of data has been recieved.
            res.on('data', (chunk) => {
                data += chunk;
            });

            // The whole response has been received. Print out the result.
            res.on('end', () => {
                const page = parse(data);
                const course_preview = page.querySelector("div[data-module-id=course-preview]")
                const course = JSON.parse(course_preview.getAttribute('data-module-args'))
                resolve(course.previews[0].media_sources[0].src);
            });
        }).on('error',(err) => {
            console.log("Error: " + err.message);
            reject(err);
        });
    })
}

const getCourseFromUdemy = async (size, categories) => {
    const url = `https://www.udemy.com/api-2.0/courses/?fields[course]=@all&page=1&page_size=${size}&category=Development&price=price-paid&instructional_level=all&duration=short`
    const udemyCourses = await udemyReq(url);
    const courses = await Promise.all(udemyCourses.results.map(async (course) => {
        return {
            name: course.title,
            preview_video: await getPreviewVideo(course.preview_url),
            brief_description: course.headline,
            detail_description: course.description,
            avg_rating: course.avg_rating,
            thumbnail: course.image_480x270,
            price: course.price_detail.amount,
            slug: course.url,
            students_learning: course.num_subscribers,
            students_rating: course.num_reviews,
        }
    }));
    return courses;
}

export default {
    getCourseFromUdemy,
}