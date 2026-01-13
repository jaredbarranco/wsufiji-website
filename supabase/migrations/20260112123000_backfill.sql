alter table "public"."reviews" drop constraint "reviews_recommendation_check";

alter table "public"."reviews" drop constraint "reviews_application_id_fkey";

alter table "public"."reviews" drop column "general_comments";

alter table "public"."reviews" drop column "overall_score";

alter table "public"."reviews" drop column "recommendation";

alter table "public"."reviews" add column "review_data" jsonb;

alter table "public"."reviews" add constraint "reviews_application_id_fkey" FOREIGN KEY (application_id) REFERENCES public.applications(id) ON DELETE CASCADE not valid;

alter table "public"."reviews" validate constraint "reviews_application_id_fkey";



